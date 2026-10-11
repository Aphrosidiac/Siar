// PM2 — fork mode, one API + one worker (bcryptjs + bundling is unsafe in cluster mode).
// The API also serves the built dashboard (WEB_DIST) for app.<domain>.
const root = __dirname.replace(/\/deploy$/, '');
module.exports = {
  apps: [
    {
      name: 'siar-api',
      cwd: `${root}/apps/api`,
      script: 'dist/index.js',
      node_args: '--env-file=.env --enable-source-maps',
      env: { NODE_ENV: 'production', WEB_DIST: `${root}/apps/web/dist`, RUN_JOBS_IN_API: 'false' },
      exec_mode: 'fork', instances: 1, wait_ready: true, listen_timeout: 20000, kill_timeout: 10000,
      max_memory_restart: '900M', time: true,
    },
    {
      name: 'siar-worker',
      cwd: `${root}/apps/api`,
      script: 'dist/worker.js',
      node_args: '--env-file=.env --enable-source-maps',
      env: { NODE_ENV: 'production' },
      exec_mode: 'fork', instances: 1, kill_timeout: 30000, max_memory_restart: '1500M', time: true,
    },
  ],
};
