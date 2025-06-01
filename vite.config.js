import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/charts-night/', // Set base for GitHub Pages project site
  plugins: [react()],
});
