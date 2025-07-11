import { env } from '#config';
import { start } from './app/app.ts';

// application init
const { dispose } = await start({
	port: env.APP.PORT,
	prefix: env.APP.BASE_URL,
	swagger: env.APP.SWAGGER_ENABLED,
});

// hot module replacement
import.meta.hot?.accept();
import.meta.hot?.dispose(async () => {
	await dispose();
});
