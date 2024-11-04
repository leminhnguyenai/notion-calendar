import pluginJs from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
        languageOptions: {
            globals: globals.node,
            parser: tsParser,
        },
    },
    {
        ignores: ["frontend/", "/demo"],
    },
    {
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            "prefer-const": "error",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
    pluginJs.configs.recommended,
    tsPlugin.configs.recommended,
];
