import {
	ArgumentMetadata,
	BadRequestException,
	Injectable,
	PipeTransform,
} from '@nestjs/common';
import { ajv, localize } from './index.ts';

@Injectable()
export class AjvValidationPipe implements PipeTransform {
	public transform(value: any, metadata: ArgumentMetadata) {
		const { metatype } = metadata;

		// if there is no metatype or it's a primitive type, skip validation.
		// Also, check if the metatype has our static 'schema' property.
		if (!metatype || !('schema' in metatype)) {
			return value;
		}

		// retrieve the schema from the static property of the DTO class
		const schema = (metatype as any).schema;

		const validate = ajv.compile(schema);

		if (validate(value)) {
			return value;
		}

		// localize errors to Spanish for user-friendly messages
		localize.es(validate.errors);

		// format errors for a clean API response
		const errors =
			validate.errors?.map((error) => {
				// clean up the instance path for better readability
				const field = error.instancePath
					? error.instancePath.slice(1)
					: error.keyword;
				return `${field}: ${error.message}`;
			}) || [];

		throw new BadRequestException(errors);
	}
}
