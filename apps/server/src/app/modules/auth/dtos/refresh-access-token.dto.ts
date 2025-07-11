import { AjvDto } from '#libs/ajv';
import { accessTokenJsonSchema } from './jwt-tokens.dto';

export class RefreshAccessTokenDto extends AjvDto({
	accessToken: accessTokenJsonSchema,
}) {}

RefreshAccessTokenDto.registerOpenApi();
