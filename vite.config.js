import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: 'buffer/',
      crypto: 'crypto-browserify',
      process: 'process',
      stream: 'stream-browserify',
      vm: 'vm-browserify',
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'buffer',
      'crypto-browserify',
      'process',
      'stream-browserify',
      'vm-browserify',
      '@solana/web3.js',
      '@solana/spl-token',
    ],
  },
})
