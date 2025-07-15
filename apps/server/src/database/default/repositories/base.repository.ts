/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { NotFoundException } from '@nestjs/common';
import {
	type Attributes,
	type CreateOptions,
	type FindOptions,
	type Identifier,
	type InstanceUpdateOptions,
} from 'sequelize';
import { type Model, type ModelCtor } from 'sequelize-typescript';
import { type MakeNullishOptional } from 'sequelize/lib/utils';
import { type IBaseRepository } from '../interfaces/base-repository.interface';
import { type PaginateResult } from '../interfaces/paginate-result.interface';

export class BaseRepository<T extends Model> implements IBaseRepository<T> {
	constructor(private readonly model: ModelCtor<T>) {}

	findAll(options?: FindOptions<Attributes<T>>): Promise<T[]> {
		return this.model.findAll(options);
	}

	findOne(id: Identifier): Promise<T | null> {
		return this.model.findByPk(id);
	}

	create(
		dto: MakeNullishOptional<T['_creationAttributes']>,
		options?: CreateOptions<Attributes<T>>,
	): Promise<T | void> {
		return this.model.create<T>(dto, options);
	}

	async update(
		id: Identifier,
		dto: {
			[x: string]: any;
		},
	): Promise<T | null> {
		const record = await this.findOne(id);
		if (!record) {
			return null;
		}
		return record.update(dto);
	}

	async delete(id: Identifier): Promise<void> {
		const record = await this.model.findByPk(id, {
			paranoid: true,
		});
		if (!record) {
			throw new NotFoundException(`Record with ID "${id}" not found`);
		}
		await record.destroy();
	}

	count(options?: FindOptions<Attributes<T>>): Promise<number> {
		return this.model.count(options);
	}

	findAndCountAll(
		options?: FindOptions<Attributes<T>>,
	): Promise<{ count: number; rows: T[] }> {
		return this.model.findAndCountAll(options);
	}

	// TODO: fix: grouped count result type returned by Sequelize is an array of objects not a number
	async paginate<C>(
		currentPage: number,
		limit: number,
		options?: Omit<FindOptions<Attributes<T>>, 'limit' | 'offset'>,
	): Promise<PaginateResult<C>> {
		const offset = (currentPage - 1) * limit;
		const { count: totalRecords, rows: data } =
			await this.model.findAndCountAll<any>({
				...options,
				limit,
				offset,
			});

		const hasMorePages = totalRecords > currentPage * limit;
		const lastPage = Math.ceil(totalRecords / limit);

		return {
			currentPage,
			data,
			hasMorePages,
			lastPage,
			totalRecords,
		};
	}
}
