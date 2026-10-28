import { FlatCompat } from '@eslint/eslintrc';

// Next 15's documented compatibility layer for ESLint 9 flat configuration.
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'dist/**', 'coverage/**', 'next-env.d.ts', 'supabase/.temp/**'] },
  ...compat.extends('next/core-web-vitals'),
];
export default config;
