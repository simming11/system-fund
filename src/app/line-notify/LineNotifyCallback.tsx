import { useRouter } from 'next/router';
import { useEffect } from 'react';
import axios from 'axios';

// Function to get the LINE Notify access token
const fetchLineNotifyToken = async (code: string | string[]) => {
  try {
    const response = await axios.post('https://notify-bot.line.me/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'https://763e-2001-fb1-121-c878-55d3-db15-9d50-ac39.ngrok-free.app/page/management',
        client_id: 'YOUR_LINE_NOTIFY_CLIENT_ID',
        client_secret: 'YOUR_LINE_NOTIFY_CLIENT_SECRET',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
 
    const { access_token } = response.data;
    localStorage.setItem('line_notify_token', access_token); // Store the token
    return access_token;
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
};

const LineNotifyCallback = () => {
  const router = useRouter();
  const { code } = router.query;

  useEffect(() => {
    if (code) {
      fetchLineNotifyToken(code)
        .then(() => router.push('/')) // Redirect after successful token fetch
        .catch((error) => console.error('Token fetch failed:', error));
    }
  }, [code, router]);

  return <div>Loading...</div>;
};

export default LineNotifyCallback;

// Function to send a message via LINE Notify
export const sendLineNotify = async (message: any) => {
  const token = localStorage.getItem('line_notify_token'); // Get token from storage
  if (!token) {
    console.error('LINE Notify token not found');
    return;
  }

  const url = 'https://notify-api.line.me/api/notify';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `message=${message}`
    });

    if (response.ok) {
      const jsonResponse = await response.json();
    } else {
      throw new Error('Failed to send LINE Notify');
    }
  } catch (error) {
    console.error('Error sending LINE Notify:', error);
  }
};
