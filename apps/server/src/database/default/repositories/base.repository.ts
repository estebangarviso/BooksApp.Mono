/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { NotFoundException } from '@nestjs/common';
import { type Attributes, type FindOptions, type Identifier } from 'sequelize';
import { type Model, type ModelCtor } from 'sequelize-typescript';

export interface IBaseRepository<T extends Model> {
	count(options?: FindOptions<Attributes<T>>): Promise<number>;
	create(dto: any, options?: any): Promise<T | void>;
	findAll(options?: any): Promise<T[]>;
	findOne(id: string): Promise<T | null>;
	softDelete(id: string): Promise<void>;
	update(id: string, dto: any): Promise<T | null>;
	paginate(options?: FindOptions<Attributes<T>>): Promise<{
		count: number;
		rows: T[];
	}>;
}

export class BaseRepository<T extends Model> implements IBaseRepository<T> {
	constructor(private readonly model: ModelCtor<T>) {}

	findAll(options?: FindOptions<Attributes<T>>): Promise<T[]> {
		return this.model.findAll(options);
	}

	findOne(id: Identifier): Promise<T | null> {
		return this.model.findByPk(id);
	}

	create(dto: any, options?: any): Promise<T | void> {
		return this.model.create(dto, options);
	}

	async update(id: string, dto: any): Promise<T | null> {
		const record = await this.findOne(id);
		if (!record) {
			return null;
		}
		return record.update(dto);
	}

	async softDelete(id: string): Promise<void> {
		const record = await this.findOne(id);
		if (!record) {
			throw new NotFoundException(`Record with ID "${id}" not found`);
		}
		await record.destroy();
	}

	count(options?: FindOptions<Attributes<T>>): Promise<number> {
		return this.model.count(options);
	}

	paginate(
		options?: FindOptions<Attributes<T>>,
	): Promise<{ count: number; rows: T[] }> {
		return this.model.findAndCountAll(options);
	}
}
