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
			readonly REQUEST_MAX_JSON_BODY_SIZE: string;
			readonly REQUEST_TIMEOUT: string;

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
			readonly SECURITY_API_KEY: string; // value of the api key header
			readonly SECURITY_HEADER_NAME: string; // name of the api key header
			readonly SECURITY_JWT_ALGORITHM: import('jsonwebtoken').Algorithm; // jWT signing algorithm
			readonly SECURITY_JWT_EXPIRES_IN: string; // jWT token expiration time
			readonly SECURITY_JWT_SECRET: string; // secret for JWT token signing
			readonly SECURITY_ENABLED?: booleanString;
		}
	}
}
