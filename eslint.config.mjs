import nextConfig from "eslint-config-next";

/** @type {import("eslint").Linter.FlatConfig[]} */
const config = [
  ...nextConfig,
  {
    // Project-specific overrides
    rules: {
      // Relax very strict rules to keep linting practical for now
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/rules-of-hooks": "warn",
      "@next/next/no-async-client-component": "off",
      "@next/next/no-img-element": "warn",
    },
  },
];

export default config;
