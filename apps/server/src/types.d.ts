import type localize from 'ajv-i18n';

export declare global {
	type millis = number;
	type booleanString = 'false' | 'true';
	type ajvI18nLanguages = keyof typeof localize;
}
