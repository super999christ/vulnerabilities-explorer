import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import svgr from 'vite-plugin-svgr';

const host = process.env.HOST || true;
const port = +(process.env.PORT || 3000);
const projectRoot = resolve(__dirname, 'src');

export default defineConfig(() => {
  return {
    root: './src',
    server: {
      host,
      port
    },
    plugins: [svgr(), react()],
    build: {
      outDir: '../build',
      sourcemap: true
    },
    envDir: '..',
    resolve: {
      alias: {
        '@root': projectRoot,
        '~': projectRoot
      }
    }
  };
});
