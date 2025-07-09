import Ajv from 'ajv';
import addFormats from 'ajv-formats';
export const ajv = new Ajv({
	coerceTypes: true,
	removeAdditional: true,
	useDefaults: true,
});
addFormats(ajv, [
	'date-time',
	'time',
	'date',
	'email',
	'hostname',
	'ipv4',
	'ipv6',
	'uri',
	'uri-reference',
	'uuid',
	'uri-template',
	'json-pointer',
	'relative-json-pointer',
	'regex',
])
	.addKeyword('kind')
	.addKeyword('modifier');

export { AjvDto, registerDtoOpenApiSchemas } from './ajv.dto.ts';
export { AjvValidationPipe } from './ajv.pipe.ts';
export { default as localize } from 'ajv-i18n';
