import {
	HealthCheckService,
	MemoryHealthIndicator,
	TerminusModule,
	TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeAll, describe, expect, it, test, vi } from 'vitest';
import { HealthController } from './health.controller';

describe(HealthController.name, () => {
	let controller: HealthController;
	let healthService: HealthCheckService;

	beforeAll(async () => {
		const TypeOrmHealthIndicatorProvider = {
			provide: TypeOrmHealthIndicator,
			useValue: {
				pingCheck: () => Promise.resolve(),
			},
		};

		const MemoryHealthIndicatorProvider = {
			provide: MemoryHealthIndicator,
			useValue: {
				checkHeap: () => Promise.resolve(),
				checkRSS: () => Promise.resolve(),
			},
		};
		const HealthCheckServiceProvider = {
			provide: HealthCheckService,
			useFactory: () => ({
				check: vi.fn(() => Promise.resolve()),
			}),
		};
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TypeOrmHealthIndicatorProvider,
				MemoryHealthIndicatorProvider,
				HealthCheckService,
				HealthCheckServiceProvider,
			],
			controllers: [HealthController],
			imports: [TerminusModule],
		}).compile();

		controller = module.get<HealthController>(HealthController);
		healthService = module.get<HealthCheckService>(HealthCheckService);
	});

	test('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('check', async () => {
		const checkSpy = vi.spyOn(healthService, 'check');
		const healthCheckResult = await controller.check();
		expect(checkSpy).toHaveBeenCalled();
		expect(healthCheckResult).not.toBeNull();
	});
});
