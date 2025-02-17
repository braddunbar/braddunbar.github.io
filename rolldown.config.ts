import { defineConfig } from 'rolldown'

export default defineConfig({
  input: '_js/repl.tsx',
  jsx: {
    mode: 'automatic',
    importSource: 'preact',
    jsxImportSource: 'preact',
  },
  output: {
    dir: 'js',
  },
})
