import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';

/**
 * Health module for the NestJS application.
 *
 * @see https://docs.nestjs.com/recipes/terminus
 *
 * @export
 * @class HealthModule
 */
@Module({
	controllers: [HealthController],
	imports: [TerminusModule],
})
export class HealthModule {}
