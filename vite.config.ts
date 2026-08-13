import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 使用相对路径 base: './'，方便直接部署到 GitHub Pages 等子目录
export default defineConfig({
  base: './',
  plugins: [react()],
});
