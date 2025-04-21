import { Command, CommandRunner, Option } from 'nest-commander';
import { DrainService } from './drain.service';

interface DrainCommandOptions {
  kubeconfig?: string;
  selector?: string;
}

@Command({
  name: 'drain',
  description: 'Safely drain all nodes',
})
export class DrainCommand extends CommandRunner {
  constructor(private readonly drain: DrainService) {
    super();
  }

  @Option({
    flags: '-k, --kubeconfig <file>',
    description: 'Use a particular kubeconfig file',
  })
  kubeconfig(val: string): string {
    return val;
  }

  @Option({
    flags: '-l, --selector <query>',
    description: 'Label selector to filter nodes',
  })
  selector(val: string): string {
    return val;
  }

  async run(passedParam: string[], options?: DrainCommandOptions) {
    await this.drain.start(options?.kubeconfig, options?.selector);
  }
}
