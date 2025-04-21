import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  await CommandFactory.run(AppModule, new ConsoleLogger());
}

bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
