import { defineConfig, loadEnv, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import { compression } from 'vite-plugin-compression2';
import autoprefixer from 'autoprefixer';

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
        // Path aliases - FSD compliant
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@entities': path.resolve(__dirname, './src/entities'),
        '@features': path.resolve(__dirname, './src/features'),
        '@widgets': path.resolve(__dirname, './src/widgets'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@app': path.resolve(__dirname, './src/app'),
        '@components': path.resolve(__dirname, './src/components'),
        '@services': path.resolve(__dirname, './src/services'),
        '@types': path.resolve(__dirname, './src/types'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@theme': path.resolve(__dirname, './src/theme'),
        '@config': path.resolve(__dirname, './src/config'),
        '@stores': path.resolve(__dirname, './src/stores'),
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
      
      // Chunk size warnings - Increased limit for enterprise app
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
          
          // Manual chunk splitting - Optimized for better code splitting
          manualChunks: (id) => {
            // Vendor chunks - Split large libraries
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              if (id.includes('@mui/material') || id.includes('@mui/icons-material')) {
                return 'mui-vendor';
              }
              if (id.includes('@emotion')) {
                return 'emotion-vendor';
              }
              if (id.includes('react-router')) {
                return 'router-vendor';
              }
              if (id.includes('axios') || id.includes('zustand') || id.includes('date-fns')) {
                return 'utils-vendor';
              }
              if (id.includes('@tanstack/react-query')) {
                return 'query-vendor';
              }
              // Other vendor libraries
              return 'vendor';
            }
            
            // Widget chunks - Split large widgets
            if (id.includes('/widgets/')) {
              if (id.includes('enterprise-optimization')) {
                return 'widget-enterprise';
              }
              if (id.includes('cutting-list') || id.includes('cutting-plan')) {
                return 'widget-cutting';
              }
              if (id.includes('modern-')) {
                return 'widget-modern';
              }
              if (id.includes('profile-optimization') || id.includes('profile-management')) {
                return 'widget-profile';
              }
              if (id.includes('statistics') || id.includes('dashboard')) {
                return 'widget-stats';
              }
              return 'widgets';
            }
            
            // Entity chunks - Split large entities
            if (id.includes('/entities/')) {
              if (id.includes('optimization')) {
                return 'entity-optimization';
              }
              if (id.includes('cutting-list') || id.includes('production-plan')) {
                return 'entity-production';
              }
              return 'entities';
            }
            
            // Feature chunks
            if (id.includes('/features/')) {
              if (id.includes('enterprise-optimization')) {
                return 'feature-enterprise';
              }
              return 'features';
            }
            
            // Component chunks
            if (id.includes('/components/')) {
              if (id.includes('EnterpriseOptimization')) {
                return 'enterprise-components';
              }
              if (id.includes('CuttingList')) {
                return 'cutting-components';
              }
              if (id.includes('Modern')) {
                return 'modern-components';
              }
              return 'components';
            }
            
            // Page chunks
            if (id.includes('/pages/')) {
              return 'pages';
            }
            
            // Store chunks
            if (id.includes('/stores/')) {
              return 'stores';
            }
            
            // Service chunks
            if (id.includes('/services/')) {
              return 'services';
            }
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
      port: 5173, // Fixed port instead of env variable
      host: 'localhost',
      
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
          secure: isProduction, // Use secure connections in production
          // ✅ KEEP /api prefix - backend expects it at /api/cutting-list
          // rewrite: (path) => path.replace(/^\/api/, ''), // DON'T rewrite
          configure: (proxy, options) => {
            // Backend health check on startup (development only)
            if (isDevelopment) {
              const backendUrl = env.VITE_API_URL || 'http://localhost:3001';
              const checkBackendHealth = async () => {
                try {
                  const response = await fetch(`${backendUrl}/health`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(2000), // 2 second timeout
                  });
                  if (response.ok) {
                    console.log('✅ [Backend] Backend server is running on', backendUrl);
                  } else {
                    console.warn('⚠️  [Backend] Backend server responded with status', response.status);
                  }
                } catch (error) {
                  console.error('\n❌ [Backend] Backend server is not running!');
                  console.error('   Please start the backend server:');
                  console.error('   - Run: cd backend && npm run dev');
                  console.error('   - Or from root: npm run dev:backend');
                  console.error('   - Or use: npm run dev (starts both frontend and backend)\n');
                }
              };
              
              // Check backend health after a short delay
              setTimeout(checkBackendHealth, 1000);
            }

            // Throttle connection error warnings (max once per 10 seconds)
            let lastErrorWarning = 0;
            const ERROR_WARNING_INTERVAL = 10000; // 10 seconds
            let successfulConnections = 0;
            
            proxy.on('error', (err, req, res) => {
              // Only show connection error warnings with throttling
              const nodeError = err as NodeJS.ErrnoException;
              if (nodeError.code === 'ECONNREFUSED') {
                const now = Date.now();
                if (now - lastErrorWarning > ERROR_WARNING_INTERVAL) {
                  lastErrorWarning = now;
                  console.error('\n❌ [Vite Proxy] Cannot connect to backend server!');
                  console.error('   Backend is not running on', env.VITE_API_URL || 'http://localhost:3001');
                  console.error('   Please start the backend server:');
                  console.error('   - Run: cd backend && npm run dev');
                  console.error('   - Or from root: npm run dev:backend');
                  console.error('   - Or use: npm run dev (starts both frontend and backend)');
                  console.error('   (This warning will be shown at most once every 10 seconds)\n');
                }
              }
            });
            
            proxy.on('proxyReq', (proxyReq, req, res) => {
              if (isDevelopment) {
                // Only log non-health-check requests to reduce noise
                if (!req.url?.includes('/health') && !req.url?.includes('/metrics/web-vitals')) {
                  console.log('🔄 [Vite Proxy]', req.method, req.url);
                }
              }
            });
            
            proxy.on('proxyRes', (proxyRes, req, res) => {
              // Track successful connections
              successfulConnections++;
              
              // Reset error warning timer on successful connection
              if (successfulConnections === 1) {
                console.log('✅ [Vite Proxy] Backend connection established successfully');
              }
              
              if (isDevelopment && !req.url?.includes('/health') && !req.url?.includes('/metrics/web-vitals')) {
                console.log('✅ [Vite Proxy]', proxyRes.statusCode, req.url);
              }
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
          autoprefixer,
          
          // CSS optimization - cssnano removed for now
        ]
      }
    },

    // ========================================================================
    // TEST CONFIGURATION
    // ========================================================================
    test: {
      globals: true,
      environment: 'node',
      mockReset: true,
      restoreMocks: true,
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
