import { Logger } from '@nestjs/common';
import { Permits, Roles } from '#libs/enums';
import * as Entities from './entities';
import { InferCreationAttributes } from 'sequelize';

export const seedDatabase = async () => {
	const logger = new Logger('DatabaseSeeder');
	try {
		const users = await Entities.User.count();
		if (users > 0) {
			logger.log('Database already seeded with users, skipping seeding.');
			return;
		}

		logger.log('Seeding database with initial data...');
        const adminRole = await Entities.Role.bulkCreate([
        {
            name: Roles.SUPER_ADMIN,
            description: 'Super Administrator with all permissions',
        }
        ]);
		const adminUser = await Entities.User.create({
			email: 'e.garvisovenegas@gmail.com',
			firstName: 'Esteban',
			lastName: 'Garviso',
			password: 'demodemo',
			refreshToken: null,
			role: ,
		});
	} catch (error) {
		logger.error('Error seeding the database', error);
	}
};
