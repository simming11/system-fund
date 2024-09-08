// File: pages/api/line-notify-token.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { code } = req.body;

    try {
      // Make the request to the LINE Notify API
      const response = await axios.post('https://notify-bot.line.me/oauth/token', null, {
        params: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: 'https://your-ngrok-url.ngrok-free.app/page/management',
          client_id: '33xlobXwswQsGjiZZRJrRR',
          client_secret: 'tSHkAU07OHB4TIkKWZTvk6ByiXXI9dJhuUpi2tS0NM4',
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Return the response back to the frontend
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching token:', error);
      res.status(500).json({ error: 'Error fetching token' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
