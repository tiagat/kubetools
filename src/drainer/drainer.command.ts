import { Command, CommandRunner } from 'nest-commander';

@Command({ name: 'drainer', description: 'Safely drain all nodes' })
export class DrainerCommand extends CommandRunner {
  async run() {
    await Promise.resolve();
    console.log('Draining all nodes...');
  }
}
