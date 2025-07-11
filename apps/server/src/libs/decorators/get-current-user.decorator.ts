import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type AccessJwtPayloadWithRefreshToken } from '../../app/modules/auth/interfaces/access-jwt-payload.interface';

export const GetCurrentUser = createParamDecorator(
	(
		data: keyof AccessJwtPayloadWithRefreshToken | undefined,
		context: ExecutionContext,
	) => {
		const request = context.switchToHttp().getRequest();
		if (!data) return request.user;
		return request.user[data];
	},
);
