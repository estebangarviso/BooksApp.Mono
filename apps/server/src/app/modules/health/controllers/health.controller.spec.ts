import {
	type HealthCheckResult,
	HealthCheckService,
	MemoryHealthIndicator,
	SequelizeHealthIndicator,
	TerminusModule,
} from '@nestjs/terminus';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, test, vi } from 'vitest';
import { ApiKey } from '../../../decorators/api-key.guard.ts';
import { HealthController } from './health.controller';

const mockHealthService = {
	check: vi.fn(() => Promise.resolve({})),
};

const mockApyKeyGuard = {
	canActivate: vi.fn(() => true),
};

describe(HealthController.name, () => {
	let controller: HealthController;
	let healthService: HealthCheckService;
	const healthCheckResult: HealthCheckResult = {
		error: {},
		info: {},
		status: 'ok',
		details: {
			database: {
				error: {},
				status: 'up',
			},
			memory_heap: {
				error: {},
				status: 'up',
			},
			memory_rss: {
				error: {},
				status: 'up',
			},
		},
	};
	beforeEach(async () => {
		const SequelizeHealthIndicatorProvider = {
			provide: SequelizeHealthIndicator,
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
			useValue: mockHealthService,
		};
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SequelizeHealthIndicatorProvider,
				MemoryHealthIndicatorProvider,
				HealthCheckServiceProvider,
			],
			controllers: [HealthController],
			imports: [TerminusModule],
		})
			.overrideGuard(ApiKey)
			.useValue(mockApyKeyGuard)
			.compile();

		controller = module.get<HealthController>(HealthController);
		healthService = module.get<HealthCheckService>(HealthCheckService);
	});

	test('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('check', () => {
		it('should call healthService.check and return health check result', async () => {
			mockHealthService.check.mockResolvedValue(healthCheckResult);
			const result = await controller.check();
			expect(mockHealthService.check).toHaveBeenCalled();
			expect(result).toBeDefined();
			expect(result).not.toBeNull();
			expect(result.status).toBe('ok');
		});
	});
});
