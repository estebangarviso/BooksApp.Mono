export const isIsbn = (value: any): value is isbn => {
	if (typeof value !== 'string') return false;
	// check if the string is a valid ISBN-10 or ISBN-13
	const isbnRegex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/;
	return isbnRegex.test(value);
};
