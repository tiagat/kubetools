import { Module } from '@nestjs/common';
import { DrainerCommand } from './drainer.command';
import { DrainerService } from './drainer.service';

@Module({
  providers: [DrainerCommand, DrainerService],
})
export class DrainerModule {}
