import { Logger } from '@nestjs/common';
import { type SequelizeModuleOptions } from '@nestjs/sequelize';
import { env } from '#config';
import { ENTITIES } from '../entities';

const logger = new Logger('SQL Query');
export const getDatabaseOptions: SequelizeModuleOptions = {
	database: env.DATABASE.DATABASE_NAME,
	dialect: env.DATABASE.DIALECT,
	host: env.DATABASE.HOST,
	password: env.DATABASE.PASSWORD,
	port: env.DATABASE.PORT,
	username: env.DATABASE.USERNAME,

	// load all entities automatically
	models: ENTITIES,

	// connection Pooling
	pool: {
		idle: 10_000,
		acquire: env.DATABASE.TIMEOUT,
		max: env.DATABASE.MAX_CONNECTIONS,
		min: 0,
	},

	// the SSL configuration for production environments
	dialectOptions: {
		connectTimeout: env.DATABASE.TIMEOUT,
		ssl:
			env.DATABASE.HOST === 'localhost'
				? false
				: { rejectUnauthorized: false },
	},

	// naming convention: snake_case
	define: {
		underscored: true,
	},

	// logging
	logging: env.DATABASE.LOGGING ? logger.log : false,

	// sync option
	synchronize: env.DATABASE.SYNCHRONIZE,
};
