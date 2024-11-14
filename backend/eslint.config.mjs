import pluginJs from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
    { files: ['**/*.{js,mjs,cjs,ts}'] },
    { languageOptions: { globals: globals.node } },
    {
        ignores: ['frontend/', '/demo'],
    },
    {
        plugins: {
            ['@typescript-eslint']: tseslint.plugin,
        },
        rules: {
            'prefer-const': 'error',
            '@typescript-eslint/no-explicit-any': 'off',
            'typescript-eslint/explicit-function-return-type': 'off',
        },
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
];
