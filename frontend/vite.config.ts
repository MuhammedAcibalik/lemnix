import { defineConfig, loadEnv, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import { compression } from 'vite-plugin-compression2';

// ============================================================================
// ENTERPRISE-GRADE VITE CONFIGURATION
// ============================================================================

export default defineConfig(({ command, mode }) => {
  
  // Environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Production optimizations
  const isProduction = command === 'build';
  const isDevelopment = command === 'serve';

  return {
    // ========================================================================
    // PLUGINS CONFIGURATION
    // ========================================================================
    plugins: [
      // Core React plugin
      react({
        // JSX runtime optimization
        jsxRuntime: 'automatic',

        // Babel configuration
        babel: {
          plugins: [
            // Emotion optimization
            '@emotion/babel-plugin'
          ]
        }
      }),

      // PWA support for mobile apps
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB limit
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },

              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                }
              }
            }
          ]
        },
        manifest: {
          name: 'LEMNİX - Alüminyum Kesim Optimizasyonu',
          short_name: 'LEMNİX',
          description: 'Enterprise-grade alüminyum profil kesim optimizasyon sistemi',
          theme_color: '#1a237e',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      }),

      // Gzip compression for production
      ...(isProduction ? [
        compression({
          algorithms: ['gzip'],
          exclude: [/\.(br)$/, /\.(gz)$/],
          threshold: 10240
        }),
        compression({
          algorithms: ['brotliCompress'],
          exclude: [/\.(br)$/, /\.(gz)$/],
          threshold: 10240
        })
      ] : []),

      // Bundle analyzer for production
      ...(isProduction ? [
        visualizer({
          filename: 'dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true
        })
      ] : [])
    ],

    // ========================================================================
    // RESOLUTION & ALIASES
    // ========================================================================
    resolve: {
      alias: {
        // Path aliases
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/components/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@types': path.resolve(__dirname, './src/types'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@assets': path.resolve(__dirname, './src/assets'),
        
        // React optimization
        'react': path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        
        // Polyfills
        'buffer': 'buffer',
        'process': 'process/browser',
        'util': 'util'
      },
      // Module resolution
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      // Dedupe packages
      dedupe: ['react', 'react-dom']
    },

    // ========================================================================
    // OPTIMIZATION & DEPENDENCIES
    // ========================================================================
    optimizeDeps: {
      // Pre-bundle dependencies
      include: [
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
        'axios',
        'zustand',
        'react-router-dom'
      ],
      // Exclude problematic packages
      exclude: ['@emotion/babel-plugin'],
      // Force pre-bundling
      force: true
    },

    // ========================================================================
    // BUILD OPTIMIZATION
    // ========================================================================
    build: {
      // Output directory
      outDir: 'dist',
      
      // Source maps
      sourcemap: isDevelopment,
      
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
      
      // Rollup options
      rollupOptions: {
        // Input configuration
        input: {
          main: path.resolve(__dirname, 'index.html')
        },
        
        // Output optimization
        output: {
          // Chunk naming strategy
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop()
              : 'chunk';
            return `js/[name]-[hash].js`;
          },
          
          // Asset naming strategy
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
              return `media/[name]-[hash].[ext]`;
            }
            if (/\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/i.test(assetInfo.name)) {
              return `images/[name]-[hash].[ext]`;
            }
            if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              return `fonts/[name]-[hash].[ext]`;
            }
            return `assets/[name]-[hash].[ext]`;
          },
          
          // Manual chunk splitting
          manualChunks: {
            // Vendor chunks
            'react-vendor': ['react', 'react-dom'],
            'mui-vendor': ['@mui/material', '@mui/icons-material'],
            'emotion-vendor': ['@emotion/react', '@emotion/styled'],
            'router-vendor': ['react-router-dom'],
            'utils-vendor': ['axios', 'zustand', 'date-fns']
          }
        },
        
        // External dependencies
        external: [],
        
        // Tree shaking
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          unknownGlobalSideEffects: false
        }
      },
      
      // Minification
      minify: isProduction ? 'terser' : false,
      

      
      // Target browsers
      target: 'es2015',
      
      // CSS optimization
      cssCodeSplit: true,
      
      // Assets optimization
      assetsInlineLimit: 4096
    },

    // ========================================================================
    // SERVER CONFIGURATION
    // ========================================================================
    server: {
      // Port configuration
      port: parseInt(env.VITE_PORT) || 3000,
      host: env.VITE_HOST || 'localhost',
      
      // HTTPS configuration
      https: env.VITE_HTTPS === 'true' ? {
        key: env.VITE_SSL_KEY,
        cert: env.VITE_SSL_CERT
      } : undefined,
      
      // CORS configuration
      cors: {
        origin: env.VITE_CORS_ORIGIN || '*',
        credentials: true
      },
      
      // Proxy configuration
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => path.replace(/^\/api/, ''), // REMOVED - Keep /api prefix
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          }
        }
      },
      
      // HMR configuration
      hmr: {
        overlay: true,
        port: 24678
      },
      
      // Open browser
      open: env.VITE_OPEN_BROWSER === 'true'
    },

    // ========================================================================
    // PREVIEW CONFIGURATION
    // ========================================================================
    preview: {
      port: parseInt(env.VITE_PREVIEW_PORT) || 4173,
      host: env.VITE_PREVIEW_HOST || 'localhost',
      open: env.VITE_PREVIEW_OPEN === 'true'
    },

    // ========================================================================
    // ENVIRONMENT & GLOBAL VARIABLES
    // ========================================================================
    define: {
      // Global polyfills
      global: 'globalThis',
      
      // Environment variables
      __DEV__: isDevelopment,
      __PROD__: isProduction,
      
      // React optimization
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.REACT_APP_VERSION': JSON.stringify(env.npm_package_version || '1.0.0')
    },

    // ========================================================================
    // CSS CONFIGURATION
    // ========================================================================
    css: {
      // CSS modules
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isDevelopment 
          ? '[name]__[local]___[hash:base64:5]'
          : '[hash:base64:8]'
      },
      
      // PostCSS configuration
      postcss: {
        plugins: [
          // Autoprefixer
          require('autoprefixer'),
          
          // CSS optimization
          ...(isProduction ? [require('cssnano')] : [])
        ]
      }
    },

    // ========================================================================
    // WORKER CONFIGURATION
    // ========================================================================
    worker: {
      format: 'es',
      plugins: () => []
    },

    // ========================================================================
    // LOGGING & DEBUGGING
    // ========================================================================
    logLevel: isDevelopment ? 'info' : 'warn',
    
    // Clear screen
    clearScreen: false
  } as UserConfig;
});
