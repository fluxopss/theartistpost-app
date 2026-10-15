// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // supabase-js ships only an "exports" map, which eslint-plugin-import's
    // resolver can't read; Metro and tsc resolve it fine.
    rules: {
      "import/no-unresolved": ["error", { ignore: ["^@supabase/supabase-js$"] }],
    },
  },
]);
