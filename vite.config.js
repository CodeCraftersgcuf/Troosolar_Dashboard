import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: true, // This allows external connections
    port: 5176, // Default Vite port
    // Let Mono's embedded widget (connect.mono.co) use the camera for facial verification
    headers: {
      'Permissions-Policy': 'camera=(self "https://connect.mono.co"), microphone=(self "https://connect.mono.co")',
    },
  },
})
