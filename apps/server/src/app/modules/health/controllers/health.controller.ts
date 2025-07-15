import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	HealthCheck,
	HealthCheckResult,
	HealthCheckService,
	MemoryHealthIndicator,
	SequelizeHealthIndicator,
} from '@nestjs/terminus';
import { ApiKey } from '../../../decorators/api-key.guard.ts';

/**
 * Health controller for the NestJS application using Terminus.
 *
 * @export
 * @class HealthController
 */
@ApiTags('Health')
@ApiKey()
@Controller({
	path: 'health',
	version: VERSION_NEUTRAL,
})
export class HealthController {
	/**
	 * @param {HealthCheckService} _health terminus health transformer
	 * @param {SequelizeHealthIndicator} db
	 * @param {MemoryHealthIndicator} memory
	 */
	constructor(
		private readonly _health: HealthCheckService,
		private readonly db: SequelizeHealthIndicator,
		private readonly memory: MemoryHealthIndicator,
	) {}

	/**
	 * Returns a set of checks to determine the health of the service.
	 *
	 * @see https://docs.nestjs.com/recipes/terminus
	 * @returns {HealthCheckResult} Health check result
	 */
	@Get()
	@ApiOperation({ summary: 'Obtener el estado del servicio' })
	@HealthCheck()
	check(): Promise<HealthCheckResult> {
		return this._health.check([
			() => this.db.pingCheck('database', { timeout: 10_000 }),
			() => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),
			() => this.memory.checkRSS('memory_rss', 512 * 1024 * 1024),
		]);
	}
}
