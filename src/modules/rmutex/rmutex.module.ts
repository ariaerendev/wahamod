import { Module } from '@nestjs/common';

import { RMutexService } from './rmutex.service';

@Module({
  providers: [RMutexService],
  exports: [RMutexService],
})
export class RMutexModule {}
