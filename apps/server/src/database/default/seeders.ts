import { type Logger } from '@nestjs/common';
import { RuntimeException } from '@nestjs/core/errors/exceptions';
import { env } from '#config';
import { AppPermission, AppRole } from '#libs/enums';
import { type Sequelize } from 'sequelize-typescript';
import {
	Author,
	Book,
	Genre,
	Permission,
	Publisher,
	Role,
	User,
} from './entities';
import { bookSeedData } from './seed-data';

async function seedRolesAndPermissions(transaction: any, logger: Logger) {
	// create Roles
	const rolesMap = new Map<AppRole, Role>();
	for (const roleName of Object.values(AppRole)) {
		const [role] = await Role.findOrCreate({
			transaction,
			where: { name: roleName },
		});
		rolesMap.set(roleName, role);
	}
	logger.log('Roles seeded.');

	// create Permissions
	const permissionsMap = new Map<AppPermission, Permission>();
	for (const permissionAction of Object.values(AppPermission)) {
		const [permission] = await Permission.findOrCreate({
			transaction,
			where: { action: permissionAction },
		});
		permissionsMap.set(permissionAction, permission);
	}
	logger.log('Permissions seeded.');

	// assign Permissions to Roles
	const superAdminRole = rolesMap.get(AppRole.SUPER_ADMIN);
	const editorRole = rolesMap.get(AppRole.EDITOR);
	if (!superAdminRole || !editorRole) {
		throw new RuntimeException(
			'Super Admin or Editor role not found. Ensure roles are created before assigning permissions.',
		);
	}

	// NOTE: is not necessary to assign all permissions to super admin role, authorization is handled by the RBAC guard.
	// await superAdminRole.$set('permissions', [...permissionsMap.values()], {
	// 	transaction,
	// });

	const editorPermissions = [
		permissionsMap.get(AppPermission.BOOKS_CREATE),
		permissionsMap.get(AppPermission.BOOKS_READ),
		permissionsMap.get(AppPermission.BOOKS_UPDATE),
	].filter(Boolean) as Permission[]; // filter out undefined in case of typo

	if (editorPermissions.length === 0) {
		throw new RuntimeException(
			'Editor permissions not found. Ensure permissions are created before assigning to roles.',
		);
	}
	await editorRole.$set('permissions', editorPermissions, {
		transaction,
	});

	return { permissionsMap, rolesMap };
}

async function seedUsers(transaction: any, rolesMap: Map<AppRole, Role>) {
	const superAdminRole = rolesMap.get(AppRole.SUPER_ADMIN);
	if (!superAdminRole)
		throw new RuntimeException(
			'Super Admin role not found. Ensure roles are created before creating users.',
		);
	const [superAdminUser] = await User.findOrCreate({
		transaction,
		where: { email: env.APP.SECURITY.SUPER_ADMIN.EMAIL },
		defaults: {
			email: env.APP.SECURITY.SUPER_ADMIN.EMAIL,
			password: env.APP.SECURITY.SUPER_ADMIN.PASS,
			roleId: superAdminRole.id,
		},
	});
	return superAdminUser;
}

async function seedBooks(transaction: any, adminUser: User) {
	for (const bookData of bookSeedData) {
		const [author] = await Author.findOrCreate({
			transaction,
			where: { name: bookData.author },
		});
		const [publisher] = await Publisher.findOrCreate({
			transaction,
			where: { name: bookData.publisher },
		});

		const [book] = await Book.findOrCreate({
			transaction,
			where: { title: bookData.title },
			defaults: {
				authorId: author.id,
				availability: bookData.availability,
				creatorId: adminUser.id,
				isbn: bookData.isbn,
				price: bookData.price,
				publisherId: publisher.id,
				title: bookData.title,
			},
		});

		const genreInstances = await Promise.all(
			bookData.genres.map((genreName) =>
				Genre.findOrCreate({
					transaction,
					where: { name: genreName },
				}).then(([genre]) => genre),
			),
		);
		await book.$set('genres', genreInstances, { transaction });
	}
}
/**
 * Checks if the database has already been seeded.
 * This is determined by checking if there are any roles, permissions, users, and books in the database.
 *
 * @returns {Promise<boolean>} True if the database is already seeded, false otherwise.
 */
async function isDatabaseAlreadySeeded(): Promise<boolean> {
	// return true; // Uncomment this line to always return true and avoid using the database
	const rolesCount = await Role.count();
	const permissionsCount = await Permission.count();
	const usersCount = await User.count();
	const booksCount = await Book.count();

	return (
		rolesCount > 0 &&
		permissionsCount > 0 &&
		usersCount > 0 &&
		booksCount > 0
	);
}

export const seedDatabase = async (sequelize: Sequelize, logger: Logger) => {
	if (await isDatabaseAlreadySeeded()) {
		logger.log('Database already seeded. Skipping seeding process.');
		return;
	}
	const transaction = await sequelize.transaction();
	try {
		logger.log('Starting database seeding...');

		const { rolesMap } = await seedRolesAndPermissions(transaction, logger);
		logger.log('Roles and Permissions seeded.');

		const superAdmin = await seedUsers(transaction, rolesMap);
		logger.log('Super admin user seeded.');

		await seedBooks(transaction, superAdmin);
		logger.log('Book data seeded.');

		await transaction.commit();
		logger.log('Database seeding finished successfully.');
	} catch (error: unknown) {
		await transaction.rollback();
		logger.error('Database seeding failed.', error);
	}
};
