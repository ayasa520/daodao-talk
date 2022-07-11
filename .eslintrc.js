module.exports = {
  "root": true,
  "env": {
    "node": true
  },
  "extends": [
    'airbnb-base',
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript"
  ],
  "settings": {
    "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"]
    },
    "import/resolver": {
      "typescript": {}
    }
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "tsconfigRootDir": "./",
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  "plugins": ["@typescript-eslint", "import"],
  "rules": {
    "no-unused-expressions": [2, {  // 禁止无用的表达式
      "allowShortCircuit": true,
      "allowTernary": true
    }],
    "comma-dangle": "off",
    "@typescript-eslint/comma-dangle": "off",
    '@typescript-eslint/no-var-requires': 'off',
    "@typescript-eslint/no-unused-vars": 2,
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-member-accessibility": ["error"],
    "@typescript-eslint/member-ordering": ["error"],
    "implicit-arrow-linebreak": ["warn", "below"],
    "@typescript-eslint/interface-name": ["off"],
    "@typescript-eslint/arrow-parens": ["off"],
    "@typescript-eslint/object-literal-sort-keys": ["off"],
    "import/no-unresolved": "error",
    "import/prefer-default-export": ["off"],
    "import/named": 2,
    "import/namespace": 2,
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }
   ],
    "import/order": [
      "error",
      {
        "newlines-between": "always",
        "groups": [
          ["builtin", "external"],
          ["internal", "parent", "sibling", "index"]
        ]
      }
    ]
  }
}
