module.exports = {
  apps: [
    {
      name: "nextjs",
      script: "npm",
      args: "run start",
      env: {
        PORT: 3000,
        NODE_ENV: "production"
      }
    },
    {
      name: "webhook",
      script: "python3",
      args: "webhooks/main.py",
      env: {
        PORT: 3001
      }
    }
  ]
}; 