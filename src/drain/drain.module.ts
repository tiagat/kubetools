import { Module } from '@nestjs/common';
import { DrainCommand } from './drain.command';
import { DrainService } from './drain.service';

@Module({
  providers: [DrainCommand, DrainService],
})
export class DrainModule {}
