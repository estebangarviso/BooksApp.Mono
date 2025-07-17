import { Type } from '@sinclair/typebox';

export enum SortOrder {
	ASC = 'asc',
	DESC = 'desc',
}

export const pageOptionsSchema = (sortByExample: string) => ({
	limit: Type.Optional(
		Type.Integer({
			description: 'Number of items per page',
			example: 10,
		}),
	),
	page: Type.Optional(
		Type.Integer({
			description: 'Page number for pagination',
			example: 1,
		}),
	),
	sortBy: Type.Optional(
		Type.String({
			description: 'Field to sort by',
			example: sortByExample,
		}),
	),
	sortOrder: Type.Optional(
		Type.Enum(SortOrder, {
			description: 'Order of sorting (asc or desc)',
			example: SortOrder.ASC,
		}),
	),
});
