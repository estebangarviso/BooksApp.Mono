import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthenticationBasedAccessStrategy } from './strategies/abac.strategy';
import { RefreshAuthenticationStrategy } from './strategies/refresh-authentication.strategy';

@Module({
	providers: [
		AuthService,
		AuthenticationBasedAccessStrategy,
		RefreshAuthenticationStrategy,
	],
	controllers: [AuthController],
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({
			global: true, // makes the JWT module available globally
		}),
	],
})
export class AuthModule {}
