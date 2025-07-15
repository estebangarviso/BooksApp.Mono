import type { Algorithm as JWTAlgorithm } from 'jsonwebtoken';

export declare global {
	type MODE = 'development' | 'production' | 'test';
	type ENV = 'dev' | 'prod';

	namespace NodeJS {
		// NOTE: only string/literal type is supported,
		// numbers or booleans are loaded as string
		interface ProcessEnv {
			readonly APP_ENV: ENV;
			readonly NODE_ENV: MODE;
			readonly DEBUG?: string;

			// SECTION: project info from package.json
			readonly APP_NAME: string;
			readonly APP_VERSION: string;

			// SECTION: other app settings
			readonly ALLOWED_ORIGINS: string;
			readonly MIN_PASSWORD_LENGTH: string;
			readonly REQUEST_MAX_JSON_BODY_SIZE: string;
			readonly REQUEST_TIMEOUT: string;
			readonly REQUEST_TIMEOUT_MS: string;
			readonly SUPPORTED_LANGS: string;

			// SECTION: database
			readonly DB_CACHE: booleanString;
			readonly DB_DATABASE: string;
			readonly DB_HOST: string;
			readonly DB_LOGGING: booleanString;
			readonly DB_MAX_CONNECTIONS: string;
			readonly DB_PASSWORD: string;
			readonly DB_PORT: string;
			readonly DB_SYNCHRONIZE: booleanString;
			readonly DB_TIMEOUT: string;
			readonly DB_TYPE: 'postgres';
			readonly DB_USERNAME: string;

			// SECTION: base
			readonly BASE_URL: string;
			readonly PORT: string;
			readonly SWAGGER_UI: booleanString;

			// SECTION: localization
			readonly LANG: string;
			readonly TZ: string;

			// SECTION: api security
			readonly SECURITY_API_KEY: string;
			readonly SECURITY_BCRYPT_SALT_ROUNDS: string;
			readonly SECURITY_JWT_ACCESS_TOKEN_EXPIRES_IN: string;
			readonly SECURITY_JWT_ACCESS_TOKEN_SECRET: string;
			readonly SECURITY_JWT_ALGORITHM: JWTAlgorithm;
			readonly SECURITY_JWT_REFRESH_SECRET: string;
			readonly SECURITY_JWT_REFRESH_TOKEN_EXPIRES_IN: string;
			readonly SECURITY_SUPER_ADMIN_EMAIL: string;
			readonly SECURITY_SUPER_ADMIN_PASS: string;
			readonly SECURITY_ENABLED?: booleanString;
		}
	}
}
