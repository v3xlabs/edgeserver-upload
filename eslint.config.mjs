import v3xlabs from 'eslint-plugin-v3xlabs';

export default [
    {
        ignores: ["eslint.config.mjs", "lib/**", "node_modules/**"],
    },
    ...v3xlabs.configs.recommended,
    {
        rules: {
            'unicorn/no-process-exit': 'off',
        },
    },
];
