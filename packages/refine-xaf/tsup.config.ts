import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: false,
    noExternal: [
        '@tiptap/extension-color',
        '@tiptap/extension-text-style',
        '@tiptap/extension-placeholder'
    ],
});
