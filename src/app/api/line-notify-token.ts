// src/app/api/line-notify-token.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { code, notify_client_id, client_secret } = req.body;

    if (!code || !notify_client_id || !client_secret) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const response = await axios.post(
        'https://notify-bot.line.me/oauth/token',
        {
          grant_type: 'authorization_code',
          code,
          redirect_uri: 'YOUR_REDIRECT_URI', // Make sure to set the correct redirect URI
          client_id: notify_client_id,
          client_secret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.status === 200) {
        return res.status(200).json(response.data);
      } else {
        return res.status(response.status).json({ error: 'Failed to fetch token' });
      }
    } catch (error: any) {  // Cast error to `any`
      return res.status(500).json({ error: 'Server error', details: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
