import { defineConfig } from 'ulint';

export default defineConfig({
  preset: 'ts',
  rules: { '@typescript-eslint/no-explicit-any': 'off' },
});
