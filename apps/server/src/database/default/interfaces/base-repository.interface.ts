/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { type TPage } from '#libs/ajv';
import {
	type Attributes,
	type CreateOptions,
	type CreationAttributes,
	type FindOptions,
	type Identifier,
	type Model,
} from 'sequelize';

export interface IBaseRepository<T extends Model> {
	/**
	 * Count the number of rows in the database that match the given options.
	 * @param options - The options to filter the count.
	 * @returns The count of matching rows.
	 */
	count(options?: FindOptions<Attributes<T>>): Promise<number>;
	/**
	 * Destroy the row corresponding to this instance.
	 * Depending on your setting for paranoid, the row will either be
	 * completely deleted, or have its deletedAt timestamp set to the current time.
	 * @param id - The identifier of the record to delete.
	 */
	delete(id: Identifier): Promise<void>;
	/**
	 * Find all rows in the database that match the given options.
	 * @param options - The options to filter the results.
	 * @returns An array of matching instances.
	 */
	findAll(options?: FindOptions<Attributes<T>>): Promise<T[]>;
	/**
	 * Find a single row in the database by its primary key.
	 * @param id - The identifier of the record to find.
	 * @returns The found instance or null if not found.
	 */
	findOne(id: Identifier): Promise<T | null>;
	/**
	 * Update the row corresponding to this instance with the given data.
	 * This is the same as calling `set` and then calling `save`.
	 * @param id - The identifier of the record to update.
	 * @param dto - The data to update the record with.
	 * @returns The updated instance or null if not found.
	 */
	update(id: Identifier, dto: CreationAttributes<T>): Promise<T | null>;
	/**
	 * Create a new row in the database.
	 * @param dto - The data to create the new row with.
	 * @param options - Additional options for the creation.
	 * @returns The created instance or void if not applicable.
	 */
	create(
		dto: CreationAttributes<T>,
		options?: CreateOptions<Attributes<T>>,
	): Promise<T | void>;
	/**
	 * Paginate the results based on the given options.
	 * @param options - The options to filter and paginate the results.
	 * @returns An object containing the count of matching rows and the rows themselves.
	 */
	paginate<C>(
		currentPage: number,
		limit: number,
		options?: Omit<FindOptions<Attributes<T>>, 'limit' | 'offset'>,
	): Promise<TPage<C>>;

	/**
	 * Find and count all rows in the database that match the given options.
	 * It is very useful for implementing pagination.
	 * @param options - The options to filter the results.
	 * @returns An object containing the count of matching rows and the rows themselves.
	 */
	findAndCountAll(
		options?: FindOptions<Attributes<T>>,
	): Promise<{ count: number; rows: T[] }>;
}
