-- Add status column to orderProfile table
ALTER TABLE orderProfile ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE orderProfile ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT NOW();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_profile_order_no ON orderProfile(orderNo);
CREATE INDEX IF NOT EXISTS idx_order_profile_transaction_id ON orderProfile(transactionId);
CREATE INDEX IF NOT EXISTS idx_order_profile_status ON orderProfile(status);

-- Create tables for logging different types of notifications
CREATE TABLE IF NOT EXISTS dataUsageLogs (
  id SERIAL PRIMARY KEY,
  orderNo VARCHAR(255) NOT NULL,
  transactionId VARCHAR(255) NOT NULL,
  usageData JSONB NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS validityUsageLogs (
  id SERIAL PRIMARY KEY,
  orderNo VARCHAR(255) NOT NULL,
  transactionId VARCHAR(255) NOT NULL,
  usageData JSONB NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS esimStatusLogs (
  id SERIAL PRIMARY KEY,
  orderNo VARCHAR(255) NOT NULL,
  transactionId VARCHAR(255) NOT NULL,
  statusData JSONB NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for the log tables
CREATE INDEX IF NOT EXISTS idx_data_usage_logs_order_no ON dataUsageLogs(orderNo);
CREATE INDEX IF NOT EXISTS idx_validity_usage_logs_order_no ON validityUsageLogs(orderNo);
CREATE INDEX IF NOT EXISTS idx_esim_status_logs_order_no ON esimStatusLogs(orderNo); 