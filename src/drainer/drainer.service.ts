import { Injectable } from '@nestjs/common';
import { KubeConfig, CoreV1Api, V1Node, V1Pod } from '@kubernetes/client-node';

@Injectable()
export class DrainerService {
  k8sApi: CoreV1Api;
  labelSelector = 'node-role.kubernetes.io/node,!migrated';

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
      const { items } = await this.k8sApi.listPodForAllNamespaces({
        fieldSelector: `spec.nodeName=${node.metadata?.name}`,
      });
      console.log(
        `\nDrain Node: ${node.metadata?.name} (${items.length} pods):\n`,
      );
      for (const pod of items) {
        await this.evictPod(pod);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async evictPod(pod: V1Pod) {
    console.log(` * Pod: ${pod.metadata?.name}`);
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
    for (const node of nodes) {
      await this.drainNode(node);
    }
  }
}
