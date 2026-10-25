import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import obsidianmd from 'eslint-plugin-obsidianmd';
import tseslint from 'typescript-eslint';
import reactX from 'eslint-plugin-react-x';

export default tseslint.config(
    globalIgnores([
        'node_modules',
        'dist',
        'test-vault',
        'assets',
        'docs',
        'eslint.config.ts',
        'main.js',
    ]),
    {
        languageOptions: {
            globals: { ...globals.browser },
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        'eslint.config.ts',
                        'manifest.json',
                        'babel.config.js',
                        'rollup.config.ts',
                        'rollup-debugging.ts',
                        'rollup-plugins/addLoggerContext.ts',
                        'rollup-plugins/buildSass.ts',
                        'rollup-plugins/replaceDevLocaleSystemWithProd.ts',
                        'test.ts',
                    ],
                },
                tsconfigRootDir: import.meta.dirname,
                extraFileExtensions: ['.json'],
            },
        },
    },
    // В проекте JS-семейство — только babel.config.js.
    // Он живёт в Node, ему нужен process.
    {
        files: ['**/*.{js,cjs,mjs}'],
        languageOptions: {
            globals: { ...globals.node },
        },
    },
    // 41 правил obsidianmd/* (recommended + locales + prefer-active-doc).
    // Включает ESLint core и type-checked правила typescript-eslint,
    // поэтому их отдельно подключать не нужно.
    ...obsidianmd.configs.recommendedWithLocalesEn,
    {
        rules: {
            // Единственное правило, выключенное в recommended — включаем.
            'obsidianmd/prefer-active-doc': 'warn',
        },
    },
    // Должно идти ПОСЛЕ obsidianmd — иначе preset переопределяет обратно на warn.
    // TypeScript сам ловит необъявленные идентификаторы, no-undef здесь дубль.
    {
        files: ['**/*.{ts,tsx,mts,cts}'],
        rules: {
            'no-undef': 'off',
        },
    },
    // console в build-скриптах и в самом логгере — это их работа, не «unnecessary logging».
    {
        files: [
            'rollup-debugging.ts',
            'rollup-plugins/**/*.ts',
            'src/core/services/logger/**',
        ],
        rules: {
            'obsidianmd/rule-custom-message': 'off',
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            'react-x': reactX,
        },
        rules: {
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/consistent-type-assertions': 'warn',
            '@typescript-eslint/consistent-type-definitions': [
                'error',
                'interface',
            ],
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-inferrable-types': 'warn',
            '@typescript-eslint/no-namespace': 'error',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/no-unnecessary-condition': 'warn',
            '@typescript-eslint/no-unnecessary-type-assertion': 'error',
            '@typescript-eslint/no-unused-expressions': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-var-requires': 'error',
            '@typescript-eslint/prefer-includes': 'warn',
            '@typescript-eslint/prefer-nullish-coalescing': 'warn',
            '@typescript-eslint/prefer-optional-chain': 'warn',
            '@typescript-eslint/prefer-readonly': 'warn',
            '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            'array-callback-return': 'error',
            'arrow-body-style': ['error', 'as-needed'],
            'consistent-return': 'error',
            'default-param-last': 'error',
            'dot-notation': 'error',
            eqeqeq: ['error', 'always'],
            'import/no-unused-modules': 'warn',
            'no-async-promise-executor': 'error',
            'no-await-in-loop': 'warn',
            'no-constant-binary-expression': 'error',
            'no-duplicate-imports': 'error',
            'no-else-return': 'error',
            'no-empty-function': 'warn',
            'no-extra-bind': 'error',
            'no-loop-func': 'error',
            'no-magic-numbers': 'off',
            'no-prototype-builtins': 'off',
            'no-return-await': 'error',
            'no-sequences': 'error',
            'no-throw-literal': 'error',
            'no-unneeded-ternary': 'error',
            'no-use-before-define': [
                'error',
                { functions: false, classes: true },
            ],
            'no-useless-concat': 'error',
            'no-useless-return': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-arrow-callback': 'warn',
            'prefer-const': 'error',
            'prefer-rest-params': 'error',
            'prefer-spread': 'error',
            'prefer-template': 'warn',
            radix: 'error',
            'react-x/exhaustive-deps': 'warn',
            'react-x/no-unused-state': 'warn',
            'react-x/rules-of-hooks': 'error',
            yoda: 'error',
        },
    },
);
