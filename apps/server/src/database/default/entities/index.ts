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

export {
	Author,
	type AuthorAttributes,
	type AuthorCreationAttributes,
} from './author.entity';
export {
	BookGenre,
	type BookGenreAttributes,
	type BookGenreCreationAttributes,
} from './book-genre.entity';
export {
	Book,
	type BookAttributes,
	type BookCreationAttributes,
} from './book.entity';
export {
	Genre,
	type GenreAttributes,
	type GenreCreationAttributes,
} from './genre.entity';
export {
	Permission,
	type PermissionAttributes,
	type PermissionCreationAttributes,
} from './permission.entity';
export {
	Profile,
	type ProfileAttributes,
	type ProfileCreationAttributes,
} from './profile.entity';
export {
	Publisher,
	type PublisherAttributes,
	type PublisherCreationAttributes,
} from './publisher.entity';
export {
	RolePermission,
	type RolePermissionAttributes,
	type RolePermissionCreationAttributes,
} from './role-permission.entity';
export {
	Role,
	type RoleAttributes,
	type RoleCreationAttributes,
} from './role.entity';
export {
	User,
	type UserAttributes,
	type UserCreationAttributes,
} from './user.entity';
// export * from './book-genre.entity';
// export * from './book.entity';
// export * from './genre.entity';
// export * from './permission.entity';
// export * from './profile.entity';
// export * from './publisher.entity';
// export * from './role-permission.entity';
// export * from './role.entity';
// export * from './user.entity';
