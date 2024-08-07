import { useRouter } from 'next/router';
import { useEffect } from 'react';
import axios from 'axios';

const LineNotifyCallback = () => {
  const router = useRouter();
  const { code, state } = router.query;

  useEffect(() => {
    if (code) {
      const getToken = async () => {
        try {
          const response = await axios.post('https://notify-bot.line.me/oauth/token', null, {
            params: {
              grant_type: 'authorization_code',
              code,
              redirect_uri: 'http://localhost:3000/page/application/create',
              client_id: 'YOUR_LINE_NOTIFY_CLIENT_ID',
              client_secret: 'YOUR_LINE_NOTIFY_CLIENT_SECRET',
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });

          const { access_token } = response.data;
          console.log('Access Token:', access_token);

          // Store the token in localStorage or your preferred storage
          localStorage.setItem('line_notify_token', access_token);
          router.push('/'); // Redirect to home or any other page
        } catch (error) {
          console.error('Error fetching token:', error);
        }
      };

      getToken();
    }
  }, [code, router]);

  return <div>Loading...</div>;
};

export default LineNotifyCallback;
