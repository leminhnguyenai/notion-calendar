import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  {
    ignores: ["frontend/", "testing/"],
  },
  {
    rules: {
      "prefer-const": "error",
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
