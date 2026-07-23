import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  
  server: {
    proxy: {
      '/api/Grading': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        secure: false,
      },
      '/api/auth': {
        target: 'http://localhost:5177',
        changeOrigin: true,
        secure: false,
      },
      '/api/exams': {
        target: 'http://localhost:5177',
        changeOrigin: true,
        secure: false,
      },
      '/api/rooms': {
        target: 'http://localhost:5177',
        changeOrigin: true,
        secure: false,
      },
      '/api/grading-batches': {
        target: 'http://localhost:5177',
        changeOrigin: true,
        secure: false,
      },
      '/api/grading-items': {
        target: 'http://localhost:5177',
        changeOrigin: true,
        secure: false,
      },
      '/api/exam-sections': {
        target: 'http://localhost:5177',
        changeOrigin: true,
        secure: false,
      },
      '/api/users': {
        target: 'http://localhost:5177',
        changeOrigin: true,
        secure: false,
      },
      '/api/Submissions': {
        target: 'http://localhost:5177',
        changeOrigin: true,
        secure: false,
      },
      '/graphql': {
        target: 'http://localhost:5177',
        changeOrigin: true,
        secure: false,
      },
      '/api/Plagiarism': {
        target: 'http://localhost:5175',
        changeOrigin: true,
        secure: false,
      },
      '/api/notifications': {
        target: 'http://localhost:5177',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
