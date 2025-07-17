import type localize from 'ajv-i18n';

export declare global {
	type millis = number;
	type isbn = string;
	type booleanString = 'false' | 'true';
	type ajvI18nLanguages = keyof typeof localize;
	type RequiredPickedType<T, K extends keyof T> = Required<Pick<T, K>>;
}
