import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
	plugins: [
		sveltekit(),
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/onnxruntime-web/dist/*.jsep.*',

					dest: 'wasm'
				}
			]
		})
	],
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
		APP_BUILD_HASH: JSON.stringify(process.env.APP_BUILD_HASH || 'dev-build')
	},
	build: {
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks: {
					// Only include dependencies that are definitely internal/bundleable
					'vendor-core': ['@sveltejs/kit', 'svelte'],
					'vendor-utils': ['dayjs', 'uuid', 'marked', 'dompurify'],
					'vendor-pyodide': ['pyodide']
					// Removed @tiptap/core, prosemirror, and codemirror from manual chunks
					// as they're being treated as external modules
				}
			}
		},
		chunkSizeWarningLimit: 1000,
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
				pure_funcs: ['console.log', 'console.debug']
			},
			mangle: {
				safari10: true
			}
		},
		// Optimize chunk loading strategy
		cssCodeSplit: true,
		assetsInlineLimit: 4096,
		// Reduce concurrent processing to save memory
		target: 'es2020'
	},
	worker: {
		format: 'es'
	},
	esbuild: {
		pure: ['console.log', 'console.debug'],
		target: 'es2020',
		// Reduce memory usage during esbuild processing
		logLevel: 'error'
	},
	// Optimize dependency resolution
	optimizeDeps: {
		include: [
			'@sveltejs/kit',
			'svelte',
			'dayjs',
			'uuid',
			'marked'
		],
		exclude: [
			'pyodide' // Let pyodide load naturally to avoid bundling issues
		]
	},
	// Server configuration for development
	server: {
		fs: {
			strict: false
		}
	}
});
