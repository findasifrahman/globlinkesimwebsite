import { NextApiRequest, NextApiResponse } from 'next';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Use the same host as the current request
const getTarget = () => {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = process.env.NODE_ENV === 'production' 
    ? 'www.globlinksolution.com' 
    : 'localhost:3000';
  return `${protocol}://${host}`;
};

const proxy = createProxyMiddleware({
  target: getTarget(),
  changeOrigin: true,
  pathRewrite: {
    '^/payssiongloblinkesimwebhhok': '/payssiongloblinkesimwebhhok',
    '^/globlinkesimwebhook': '/globlinkesimwebhook',
  },
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // @ts-ignore
  return proxy(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 