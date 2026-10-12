import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { loadNewBuild } from './lib/stale';
import './styles.css';

// Vite reports a failed chunk preload here before the import itself fails
window.addEventListener('vite:preloadError', (e) => { if (loadNewBuild()) e.preventDefault(); });

createApp(App).use(router).mount('#app');
