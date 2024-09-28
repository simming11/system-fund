// pages/api/lineNotify.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { message, token } = req.body;

  try {
    const response = await axios.post(
      'https://notify-api.line.me/api/notify',
      `message=${message}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send LINE Notify' });
  }
}
