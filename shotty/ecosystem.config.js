module.exports = {
  apps: [
    {
      name: 'shotty',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/shotty/shotty',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
