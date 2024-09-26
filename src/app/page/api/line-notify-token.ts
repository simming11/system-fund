import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', 'https://system-fund.vercel.app'); // Replace with your frontend domain
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end(); // End OPTIONS request
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Enable CORS for actual requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://system-fund.vercel.app'); // Replace with your frontend domain
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  try {
    const { code, notify_client_id, client_secret } = req.body;

    if (!code || !notify_client_id || !client_secret) {
      return res.status(400).json({ error: 'Required parameters are missing' });
    }

    // Make the request to the LINE Notify API
    const responseToken = await axios.post('https://notify-bot.line.me/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.LINE_REDIRECT_URI || 'https://system-fund.vercel.app/page/notify',
        client_id: notify_client_id,
        client_secret: client_secret,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return res.status(200).json(responseToken.data);
  } catch (error) {
    // Handle AxiosError specifically
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data);
      return res.status(500).json({ error: error.response?.data?.error || 'Error fetching token' });
    } else {
      // Handle generic error
      console.error('Error fetching token:', error);
      return res.status(500).json({ error: 'Error fetching token' });
    }
  }
}
