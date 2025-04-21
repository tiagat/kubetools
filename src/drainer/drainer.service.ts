import { Injectable } from '@nestjs/common';
import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';

@Injectable()
export class DrainerService {
  k8sApi: CoreV1Api;
  labelSelector = 'node-role.kubernetes.io/node,!migrated';

  async getNodes(): Promise<string[]> {
    console.log('Define node selector:', this.labelSelector);
    console.log('List cluster nodes...');
    try {
      const { items } = await this.k8sApi.listNode({
        labelSelector: this.labelSelector,
      });
      console.log(` * Found ${items.length} nodes`);
    } catch (err) {
      console.error(err);
      throw err;
    }

    return [];
  }

  async start(kubeconfig?: string): Promise<void> {
    const k8sConfig = new KubeConfig();
    if (kubeconfig) {
      k8sConfig.loadFromFile(kubeconfig);
    } else {
      k8sConfig.loadFromDefault();
    }
    this.k8sApi = k8sConfig.makeApiClient(CoreV1Api);

    await Promise.resolve();
    console.log('Safely drain all Nodes...');

    await this.getNodes();
  }
}
