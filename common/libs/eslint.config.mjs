import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
	{
		ignores: [
			'build/**/*',
			'dist/**/*',
			'**/node_modules/**/*',
			'.reports/**/*',
			'.vscode/**/*',
			'.wireit/**/*',
			'.rollup.cache/**/*',
		],
	},
	{ files: ['**/*.{js,mjs,cjs,ts}'] },
	{ languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	eslintPluginPrettierRecommended,
];
