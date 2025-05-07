const { exec } = require('child_process');
const https = require('https');

// Get the domain from environment variable
const domain = process.env.RAILWAY_PUBLIC_DOMAIN;
if (!domain) {
  console.error('RAILWAY_PUBLIC_DOMAIN environment variable is not set');
  process.exit(1);
}

// Make a GET request to the process-queue endpoint
const options = {
  hostname: domain,
  path: '/api/cron/process-queue',
  method: 'GET',
  headers: {
    'User-Agent': 'Railway-Cron'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Queue processing response:', data);
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Error processing queue:', error);
  process.exit(1);
});

req.end(); 