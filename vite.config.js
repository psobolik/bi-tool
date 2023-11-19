import { defineConfig } from "vite";

export default defineConfig({
    clearScreen: false,
    build: {
        base: 'bi-tool',
        outDir: 'dist/bi-tool',
        sourcemap: true,
        rollupOptions: {
            external: ['./config.json']
        }
    }
})