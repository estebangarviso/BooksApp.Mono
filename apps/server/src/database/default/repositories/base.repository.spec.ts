import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, type TestingModule } from '@nestjs/testing';
import { Model } from 'sequelize-typescript';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BaseRepository } from './base.repository';

interface TestModelAttributes {
	id: string;
	name: string;
}

type TestModelCreationAttributes = Omit<TestModelAttributes, 'id'>;

class TestModel extends Model<
	TestModelAttributes,
	TestModelCreationAttributes
> {
	declare id: string;
	declare name: string;
}

describe('BaseRepository', () => {
	let repository: BaseRepository<TestModel>;
	let mockTestModel: typeof TestModel;

	const mockData: TestModel[] = [
		{ id: '1', name: 'Test 1' } as TestModel,
		{ id: '2', name: 'Test 2' } as TestModel,
	];

	beforeEach(async () => {
		vi.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: BaseRepository,
					inject: [getModelToken(TestModel)],
					useFactory: (model: typeof TestModel) =>
						new BaseRepository(model),
				},
				{
					provide: getModelToken(TestModel),
					useValue: {
						count: vi.fn(),
						create: vi.fn(),
						findAll: vi.fn(),
						findAndCountAll: vi.fn(),
						findByPk: vi.fn(),
						findOne: vi.fn(),
					},
				},
			],
		}).compile();
		// create instance of repository with mock model
		repository = module.get<BaseRepository<TestModel>>(BaseRepository);
		mockTestModel = module.get<typeof TestModel>(getModelToken(TestModel));
	});

	it('should be defined', () => {
		expect(repository).toBeDefined();
		expect(mockTestModel).toBeDefined();
	});

	describe('findAll', () => {
		it('should return all records', async () => {
			vi.mocked(mockTestModel.findAll).mockResolvedValue(mockData);
			const options = { where: { active: true } };

			const result = await repository.findAll(options);

			expect(mockTestModel.findAll).toHaveBeenCalledWith(options);
			expect(result).toStrictEqual(mockData);
		});
	});

	describe('findOne', () => {
		it('should return a record by id', async () => {
			const id = '1';
			vi.mocked(mockTestModel.findByPk).mockResolvedValue(mockData[0]);

			const result = await repository.findOne(id);

			expect(mockTestModel.findByPk).toHaveBeenCalledWith(id);
			expect(result).toStrictEqual(mockData[0]);
		});

		it('should return null if record not found', async () => {
			const id = 'nonexistent';
			vi.mocked(mockTestModel.findByPk).mockResolvedValue(null);

			const result = await repository.findOne(id);

			expect(mockTestModel.findByPk).toHaveBeenCalledWith(id);
			expect(result).toBeNull();
		});
	});

	describe('create', () => {
		it('should create and return a new record', async () => {
			const dto = { name: 'New Test' };
			const options = { returning: true };
			const createdRecord = { id: '3', ...dto };
			vi.mocked(mockTestModel.create).mockResolvedValue(
				createdRecord as any,
			);

			const result = await repository.create(dto, options);

			expect(mockTestModel.create).toHaveBeenCalledWith(dto, options);
			expect(result).toStrictEqual(createdRecord);
		});
	});

	describe('update', () => {
		it('should update and return an existing record', async () => {
			const id = '1';
			const dto = {
				name: 'Updated Test',
			};
			const updatedRecord = { id, ...dto };

			vi.mocked(mockTestModel.findByPk).mockResolvedValue({
				id,
				name: 'Test 1',
				update: vi.fn().mockResolvedValue(updatedRecord),
			} as any);

			const result = await repository.update(id, dto);

			expect(mockTestModel.findByPk).toHaveBeenCalledWith(id);
			expect(result).toStrictEqual(updatedRecord);
		});

		it('should return null if record to update not found', async () => {
			const id = 'nonexistent';
			const dto = { name: 'Updated Test' };
			vi.mocked(mockTestModel.findByPk).mockResolvedValue(null);

			const result = await repository.update(id, dto);

			expect(mockTestModel.findByPk).toHaveBeenCalledWith(id);
			expect(result).toBeNull();
		});
	});

	describe('delete', () => {
		it('should delete an existing record', async () => {
			const id = '1';
			const mockRecord = {
				id,
				destroy: vi.fn().mockResolvedValue(void 0),
			};
			vi.mocked(mockTestModel.findByPk).mockResolvedValue(
				mockRecord as any,
			);

			await repository.delete(id);

			expect(mockTestModel.findByPk).toHaveBeenCalledWith(id, {
				paranoid: true,
			});
			expect(mockRecord.destroy).toHaveBeenCalled();
		});

		it('should throw NotFoundException if record to delete not found', async () => {
			const id = 'nonexistent';
			vi.mocked(mockTestModel.findByPk).mockResolvedValue(null);
			await expect(repository.delete(id)).rejects.toThrow(
				NotFoundException,
			);
			await expect(repository.delete(id)).rejects.toThrow(
				`Record with ID "${id}" not found`,
			);
		});
	});

	describe('count', () => {
		it('should return count of records', async () => {
			const options = { where: { active: true } };
			const count = 5;
			vi.mocked(mockTestModel.count).mockResolvedValue(count);

			const result = await repository.count(options);

			expect(mockTestModel.count).toHaveBeenCalledWith(options);
			expect(result).toBe(count);
		});
	});

	describe('findAndCountAll', () => {
		it('should return records and count', async () => {
			const options = { where: { active: true } };
			const findAndCountAllResult: {
				count: number;
				rows: Model<any, any>[];
			} = {
				count: mockData.length,
				rows: mockData,
			};

			vi.mocked(mockTestModel.findAndCountAll).mockResolvedValue(
				findAndCountAllResult as any,
			);
			const result = await repository.findAndCountAll(options);

			expect(mockTestModel.findAndCountAll).toHaveBeenCalledWith(options);
			expect(result).toStrictEqual(findAndCountAllResult);
		});
	});

	describe('paginate', () => {
		it('should return paginated result', async () => {
			const currentPage = 2;
			const limit = 10;
			const offset = (currentPage - 1) * limit;
			const options = { where: { active: true } };
			const totalRecords = 25;
			const findAndCountAllResult: {
				count: number;
				rows: Model<any, any>[];
			} = {
				count: totalRecords,
				rows: mockData,
			};

			vi.mocked(mockTestModel.findAndCountAll).mockResolvedValue(
				findAndCountAllResult as any,
			);

			const result = await repository.paginate(
				currentPage,
				limit,
				options,
			);

			expect(mockTestModel.findAndCountAll).toHaveBeenCalledWith({
				...options,
				limit,
				offset,
			});

			expect(result).toStrictEqual({
				currentPage,
				data: mockData,
				hasMorePages: true, // 25 > 2 * 10
				lastPage: 3, // ceil(25/10)
				totalRecords,
			});
		});

		it('should handle last page correctly', async () => {
			const currentPage = 3;
			const limit = 10;
			const offset = (currentPage - 1) * limit;
			const totalRecords = 25;
			const findAndCountAllResult: {
				count: number;
				rows: Model<any, any>[];
			} = {
				count: totalRecords,
				rows: mockData.slice(0, 5), // last page has only 5 records
			};

			vi.mocked(mockTestModel.findAndCountAll).mockResolvedValue(
				findAndCountAllResult as any,
			);

			const result = await repository.paginate(currentPage, limit);

			expect(mockTestModel.findAndCountAll).toHaveBeenCalledWith({
				limit,
				offset,
			});

			expect(result).toStrictEqual({
				currentPage,
				data: mockData.slice(0, 5),
				hasMorePages: false, // 25 <= 3 * 10
				lastPage: 3, // ceil(25/10)
				totalRecords,
			});
		});
	});
});
