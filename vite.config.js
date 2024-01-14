import { defineConfig } from "vite";

export default defineConfig({
    base: '/bi-tool',
    clearScreen: false,
    build: {
        outDir: 'dist/bi-tool',
        sourcemap: true,
        rollupOptions: {
            external: ['./config.json']
        }
    }
})