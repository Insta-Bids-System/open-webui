import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

export default defineConfig({
	plugins: [sveltekit()],
	
	// Critical fix for DigitalOcean custom domain
	preview: {
		host: true,
		port: 4173,
		allowedHosts: [
			'aihub.instabids.ai',
			'instabids-open-webui-direct-mvl84.ondigitalocean.app',
			'.ondigitalocean.app',
			'localhost'
		]
	},
	
	server: {
		host: true,
		port: 5173,
		allowedHosts: [
			'aihub.instabids.ai', 
			'instabids-open-webui-direct-mvl84.ondigitalocean.app',
			'.ondigitalocean.app',
			'localhost'
		]
	},

	// 🔧 CRITICAL FIX: Worker configuration for Pyodide build error
	worker: {
		format: 'es'
	},

	define: {
		APP_VERSION: JSON.stringify(pkg.version),
		APP_BUILD_HASH: JSON.stringify(process.env.APP_BUILD_HASH || 'dev-build')
	},

	build: {
		target: 'esnext',
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Remove the pyodide check that was causing build issues
					if (id.includes('node_modules')) {
						if (id.includes('svelte')) {
							return 'svelte';
						}
						if (id.includes('@sveltejs')) {
							return 'sveltekit';
						}
						return 'vendor';
					}
				}
			}
		}
	},

	optimizeDeps: {
		include: ['katex', 'mermaid']
	}
});
