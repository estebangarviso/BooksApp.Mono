import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type AccessJwtPayload } from '../../app/modules/auth/interfaces/access-jwt-payload.interface';

export const GetCurrentUserId = createParamDecorator(
	(_: undefined, context: ExecutionContext): string => {
		const request = context.switchToHttp().getRequest();
		const user = request.user as AccessJwtPayload;
		return user.sub;
	},
);
