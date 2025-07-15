export interface PaginateResult<T> {
	/**
	 * The current page number.
	 */
	currentPage: number;
	/**
	 * The data for the current page.
	 */
	data: T[];
	/**
	 * Indicates if there are more pages available.
	 */
	hasMorePages: boolean;
	/**
	 * The last page number based on the total records and limit.
	 */
	lastPage: number;
	/**
	 * The total number of records across all pages.
	 */
	totalRecords: number;
}
