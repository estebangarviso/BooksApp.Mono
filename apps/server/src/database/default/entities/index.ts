import { Author } from './author.entity';
import { BookGenre } from './book-genre.entity';
import { Book } from './book.entity';
import { Genre } from './genre.entity';
import { Permission } from './permission.entity';
import { Profile } from './profile.entity';
import { Publisher } from './publisher.entity';
import { RolePermission } from './role-permission.entity';
import { Role } from './role.entity';
import { User } from './user.entity';

export const ENTITIES = [
	Role,
	User,
	Profile,
	Permission,
	RolePermission,
	Author,
	Publisher,
	Genre,
	Book,
	BookGenre,
];

export * from './author.entity';
export * from './book-genre.entity';
export * from './book.entity';
export * from './genre.entity';
export * from './permission.entity';
export * from './profile.entity';
export * from './publisher.entity';
export * from './role-permission.entity';
export * from './role.entity';
export * from './user.entity';
