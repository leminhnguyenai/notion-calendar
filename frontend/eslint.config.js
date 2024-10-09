import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";

export default [
  { files: ["**/*.{js,mjs,cjs,vue}"] },
  { languageOptions: { globals: globals.browser } },
  {
    rules: {
      "prefer-const": "error",
    },
  },
  pluginJs.configs.recommended,
  ...pluginVue.configs["flat/essential"],
];
