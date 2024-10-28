import pluginJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.node } },
    {
        ignores: ["frontend/", "/demo"],
    },
    {
        rules: {
            "prefer-const": "error",
            "typescript-eslint/explicit-function-return-type": "off",
        },
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
];
