// PM2 — gestor de procesos para producción sin Docker
// Uso: pm2 start ecosystem.config.js --env production
module.exports = {
  apps: [
    {
      name: 'nova-backend',
      script: 'dist/main.js',
      cwd: __dirname,
      instances: 'max',
      exec_mode: 'cluster',
      env: { NODE_ENV: 'development' },
      env_production: { NODE_ENV: 'production' },
      max_memory_restart: '512M',
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      watch: false,
      autorestart: true,
    },
  ],
};
