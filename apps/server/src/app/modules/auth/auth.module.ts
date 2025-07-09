import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { env } from '#config';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './services/jwt.strategy';

@Module({
	providers: [AuthService, JwtStrategy],
	controllers: [AuthController],
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({
			secret: env.APP.SECURITY.JWT.SECRET,
			signOptions: {
				algorithm: env.APP.SECURITY.JWT.ALGORITHM,
				expiresIn: env.APP.SECURITY.JWT.EXPIRES_IN,
			},
		}),
	],
})
export class AuthModule {}
