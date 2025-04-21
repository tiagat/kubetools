import { Command, CommandRunner, Option } from 'nest-commander';
import { DrainerService } from './drainer.service';

interface DrainerCommandOptions {
  kubeconfig?: string;
}

@Command({
  name: 'drainer',
  description: 'Safely drain all nodes',
})
export class DrainerCommand extends CommandRunner {
  constructor(private readonly drainer: DrainerService) {
    super();
  }

  @Option({
    flags: '-k, --kubeconfig <file>',
    description: 'Use a particular kubeconfig file',
  })
  kubeconfig(val: string): string {
    return val;
  }

  async run(passedParam: string[], options?: DrainerCommandOptions) {
    const kubeconfig = options?.kubeconfig;
    await this.drainer.start(kubeconfig);
  }
}
