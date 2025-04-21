import { Module } from '@nestjs/common';
import { DrainerCommand } from './drainer.command';

@Module({
  providers: [DrainerCommand],
})
export class DrainerModule {}
