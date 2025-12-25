import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@stage1': path.resolve(__dirname, '../stage 1 idea lab/idea-lab_-project-charter'),
      '@stage2': path.resolve(__dirname, '../stage 2 idea simulation')
    },
    // Ensure Vite looks in combined's node_modules first for all dependencies
    dedupe: [
      'react', 
      'react-dom', 
      'zustand', 
      'reactflow',
      '@google/genai',
      'lucide-react',
      'framer-motion',
      'html-to-image',
      'jspdf'
    ]
  },
  optimizeDeps: {
    // Force include dependencies that are imported from external directories
    include: [
      '@google/genai',
      'zustand',
      'lucide-react', 
      'reactflow',
      'framer-motion',
      'html-to-image',
      'jspdf'
    ]
  },
  server: {
    port: 5173,
    // Fix for resolving dependencies in parent directories
    fs: {
      allow: [
        path.resolve(__dirname, '..'),
        path.resolve(__dirname)
      ]
    }
  }
});
