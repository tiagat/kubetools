import { Module } from '@nestjs/common';
import { DrainModule } from './drain/drain.module';
import { ScalerModule } from './scaler/scaler.module';

@Module({
  imports: [DrainModule, ScalerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
