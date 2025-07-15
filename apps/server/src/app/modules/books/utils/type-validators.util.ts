/**
 * Utility function to validate if a value is a valid ISBN.
 * It checks if the value is a string and matches the ISBN-10 or ISBN-13 format.
 *
 * @param value - The value to validate.
 * @returns True if the value is a valid ISBN, false otherwise.
 * @example
 * ```typescript
 * isIsbn('978-3-16-148410-0'); // true
 * isIsbn('123456789X'); // true
 * isIsbn('invalid-isbn'); // false
 * ```
 */
export const isIsbn = (value: any): value is isbn => {
	if (typeof value !== 'string') return false;
	// check if the string is a valid ISBN-10 or ISBN-13
	const isbnRegex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/u;
	return isbnRegex.test(value);
};
