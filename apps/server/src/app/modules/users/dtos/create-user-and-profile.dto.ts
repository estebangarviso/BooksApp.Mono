import { type Omit } from '@sinclair/typebox';
import type { ProfileCreationAttributes } from '#db';

export type CreateUserWithDetailsDto = {
	email: string;
	password: string;
	roleId: number;
	profile?: Omit<ProfileCreationAttributes, 'userId'>;
};
