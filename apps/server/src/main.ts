import { env } from '#config';
import { start } from './app/app.ts';

// application init
const { dispose } = await start({
	port: env.APP.PORT,
	prefix: env.APP.BASE_URL,
	swagger: env.APP.SWAGGER_ENABLED,
});

console.info(
	`\n  \u001B[32m➜\u001B[0m Local: \u001B[36mhttp://localhost:${env.APP.PORT}/${env.APP.BASE_URL}\u001B[0m\n`,
);

// hot module replacement
import.meta.hot?.accept();
import.meta.hot?.dispose(async () => {
	await dispose();
});
