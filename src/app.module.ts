import { Module } from '@nestjs/common';
import { DrainerModule } from './drainer/drainer.module';
import { ScalerModule } from './scaler/scaler.module';

@Module({
  imports: [DrainerModule, ScalerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
