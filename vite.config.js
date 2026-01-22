import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'spicy-geese-talk.loca.lt',
      'pretty-goats-cross.loca.lt',
      'proagreement-anastacia-transsolid.ngrok-free.dev'
    ]
  }
})
