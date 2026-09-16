// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config'
import nextConfig from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextConfig,
  globalIgnores([
    '.next/**',
    '**/.next/**',
    'out/**',
    'build/**',
    '**/node_modules/**',
    'next-env.d.ts',
  ]),
])
