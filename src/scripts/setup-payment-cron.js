/**
 * This script sets up a cron job to process payments and generate eSIMs.
 * It should be run on your server or a cloud function that supports cron jobs.
 * 
 * Example usage with node-cron:
 * npm install node-cron
 * node src/scripts/setup-payment-cron.js
 */

const cron = require('node-cron');
const fetch = require('node-fetch');

// URL of the payment processing endpoint
const PROCESS_PAYMENTS_URL = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/process`
  : 'http://localhost:3000/api/payment/process';

// Schedule the cron job to run every minute
cron.schedule('* * * * *', async () => {
  console.log('Running payment processing cron job...');
  
  try {
    const response = await fetch(PROCESS_PAYMENTS_URL);
    const data = await response.json();
    
    console.log(`Processed ${data.processed} payments`);
    
    if (data.results && data.results.length > 0) {
      console.log('Results:', data.results);
    }
  } catch (error) {
    console.error('Error running payment processing cron job:', error);
  }
});

console.log('Payment processing cron job scheduled to run every minute'); 