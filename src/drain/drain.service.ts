import { Injectable } from '@nestjs/common';
import { styleText } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { KubeConfig, CoreV1Api, V1Node, V1Pod, V1Eviction } from '@kubernetes/client-node';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class DrainService {
  k8sApi: CoreV1Api;
  labelSelector = 'node-role.kubernetes.io/node,!migrated';

  async getPods(node: string): Promise<V1Pod[]> {
    const { items } = await this.k8sApi.listPodForAllNamespaces({
      fieldSelector: `spec.nodeName=${node}`,
    });
    return items;
  }

  async isYes(): Promise<boolean> {
    const rl = createInterface({ input: stdin, output: stdout });
    const answer = await rl.question('Do you want to proceed? (y/n): ');
    rl.close();
    return answer.toLowerCase() === 'y';
  }

  async getNodes(): Promise<V1Node[]> {
    console.log('Define node selector:', this.labelSelector);
    console.log('List cluster nodes...');
    try {
      const { items } = await this.k8sApi.listNode({
        labelSelector: this.labelSelector,
      });
      console.log(` * Found ${items.length} nodes`);
      return items;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async drainNode(node: V1Node): Promise<void> {
    try {
      const pods = await this.getPods(node.metadata!.name!);
      console.log(`\nDrain Node: ${node.metadata?.name} (${pods.length} pods):\n`);
      for (const pod of pods) {
        await this.evictPod(pod);
      }
      console.log('\n');
      await this.validateCluster();
      console.log('Cluster validated\n');
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async evictPod(pod: V1Pod) {
    const { name, namespace } = pod.metadata!;
    if (!name || !namespace) return;

    const evictionRequest: V1Eviction = {
      apiVersion: 'policy/v1',
      kind: 'Eviction',
      metadata: {
        name: name,
        namespace: namespace,
      },
    };

    try {
      await this.k8sApi.createNamespacedPodEviction({
        name,
        namespace: namespace,
        body: evictionRequest,
      });
      console.log(` * Pod: [${pod.metadata?.name}] - evicted`);
    } catch (err) {
      console.error(styleText('red', ` * Pod: [${pod.metadata?.name}] - error: ${err} `));
    }
  }

  async validateCluster(revalidating = false): Promise<void> {
    const { items } = await this.k8sApi.listPodForAllNamespaces({
      fieldSelector: 'status.phase!=Running',
    });

    const criticalPods = items.filter((pod) => {
      const { priorityClassName } = pod.spec!;
      if (!priorityClassName) return false;
      const criticalClasses = ['system-node-critical', 'system-cluster-critical'];
      return criticalClasses.includes(priorityClassName);
    });

    if (criticalPods.length > 0) {
      const timeout = 10000;
      console.log(`Wait for critical pods [${criticalPods.length} pods] to be running (${timeout / 1000}s)...`);
      await sleep(timeout);
      await this.validateCluster();
    }

    if (criticalPods.length === 0 && !revalidating) {
      const timeout = 10000;
      console.log(`Revalidating in ${timeout / 1000}s to make sure it does not flap`);
      await sleep(timeout);
      await this.validateCluster(true);
    }
  }

  async start(kubeconfig?: string, selector?: string): Promise<void> {
    const k8sConfig = new KubeConfig();

    if (selector) this.labelSelector = selector;

    if (kubeconfig) {
      k8sConfig.loadFromFile(kubeconfig);
    } else {
      k8sConfig.loadFromDefault();
    }
    this.k8sApi = k8sConfig.makeApiClient(CoreV1Api);

    const nodes = await this.getNodes();

    if (!(await this.isYes())) return;

    for (const node of nodes) {
      await this.drainNode(node);
    }
  }
}
