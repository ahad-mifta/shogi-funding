module.exports = {
  apps: [
    {
      name: 'shogi-preview',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 443
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      wait_ready: true,
      listen_timeout: 3000,
      shutdown_with_message: true,
      watch: ['server.js', 'public'],
      ignore_watch: ['node_modules', 'certs', 'logs'],
      watch_delay: 1000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ],
  deploy: {
    production: {
      user: 'node',
      host: 'shogisystems.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/shogi-preview.git',
      path: '/var/www/shogi-preview',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'echo "Deploying to production"'
    }
  }
};
