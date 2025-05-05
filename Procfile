web: npm run start
payment_webhook: uvicorn webhook_payment.main:app --host 0.0.0.0 --port $PORT_PAYMENT
esim_webhook: uvicorn webhook_esim.main:app --host 0.0.0.0 --port $PORT_ESIM 