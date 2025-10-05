import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {readFileSync} from "node:fs";

// Lees de versie uit package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});