import { Logger, Module, type OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { getDatabaseOptions } from '#db/config';
import { AuthModule, BooksModule, UsersModule } from './modules/index.ts';

@Module({
	imports: [
		SequelizeModule.forRoot(getDatabaseOptions()),
		AuthModule,
		BooksModule,
		UsersModule,
	],
})
export class AppModule implements OnModuleInit {
	onModuleInit() {
		this._logger.debug('Module started');
	}

	private readonly _logger: Logger = new Logger(AppModule.name);
}
