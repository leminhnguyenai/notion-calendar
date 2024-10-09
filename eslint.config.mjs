import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs" },
  },
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
];
