import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import commonjs from 'vite-plugin-commonjs'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

/** @type {import('vite').UserConfig} */
export default defineConfig({  
    plugins: [    
        tailwindcss(),  
        commonjs({
            filter(id) {
              if (id.includes('node_modules/xxx')) {
                return true
              }
            }
          }),
          nodePolyfills(),
    ],
    base: "./",
})