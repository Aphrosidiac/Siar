// PM2 on a shared box (lewixportal-vps): one process runs the API and the jobs (RUN_JOBS_IN_API=true in the
// env file) to save memory, and serves the built dashboard. Paths are the release this file ships in.
const root = __dirname;
module.exports = {
  apps: [
    {
      name: 'siar-api',
      cwd: `${root}/api`,
      script: 'dist/index.js',
      interpreter: '/opt/node22/bin/node',
      node_args: '--env-file=/srv/siar/shared/.env --enable-source-maps',
      env: { NODE_ENV: 'production', WEB_DIST: `${root}/web` },
      exec_mode: 'fork', instances: 1, kill_timeout: 15000,
      max_memory_restart: '600M', time: true,
    },
  ],
};
