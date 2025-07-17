import {
	type CallHandler,
	type ExecutionContext,
	type NestInterceptor,
} from '@nestjs/common';
import { type User } from '#db';
import { type TPage } from '#libs/ajv';
import { map, type Observable } from 'rxjs';
import { UserVo } from '../vos/user.vo.ts';

export class CreateUserInterceptor implements NestInterceptor {
	intercept(
		context: ExecutionContext,
		handler: CallHandler,
	): Observable<any> {
		return handler.handle().pipe(
			map((data) =>
				data.map((item: TPage<User>) => {
					const res: TPage<UserVo> = {
						...item,
						data: item.data.map((user) => {
							const input: UserVo = {
								id: user.id,
								createdAt: user.createdAt,
								email: user.email,
								firstName: user.profile?.firstName || '',
								hasAccess: user.hasAccess(),
								lastName: user.profile?.lastName || '',
								roleName: user.role.name,
								updatedAt: user.updatedAt,
							};
							return UserVo.parseSchema(input);
						}),
					};
					return res;
				}),
			),
		);
	}
}
