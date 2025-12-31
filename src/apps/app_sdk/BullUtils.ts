import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { RegisterQueueOptions } from '@nestjs/bullmq/dist/interfaces/register-queue-options.interface';
import { DynamicModule } from '@nestjs/common';

/**
 * Registers a queue with both BullModule and BullBoardModule
 * This ensures that whenever a queue is registered, it's also added to the Bull Board
 *
 * @param options Queue options including name
 * @returns An array of dynamic modules for both BullModule and BullBoardModule
 */
export function RegisterAppQueue(
  options: RegisterQueueOptions,
): DynamicModule[] {
  return [
    BullModule.registerQueue({
      ...options,
    }),
    BullBoardModule.forFeature({
      name: options.name,
      adapter: BullMQAdapter,
    }),
  ];
}
