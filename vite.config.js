import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isTest = !!process.env.VITEST;
  return {
    plugins: isTest ? [] : [sveltekit()],
    server: { hmr: {} },
    resolve: {
      alias: isTest ? {
        '$app/environment': path.resolve('./src/test/shims/app-environment.ts')
      } : {}
    },
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.test.{js,ts}', 'src/**/*.spec.{js,ts}']
    }
  }
})
