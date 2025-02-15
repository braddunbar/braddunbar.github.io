import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  build: {
    lib: {
      name: 'repl',
      fileName: 'repl',
      entry: '_js/repl.tsx',
      formats: ['es'],
    },
    outDir: '_site/js',
    target: 'esnext',
  }
})
