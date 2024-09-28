import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code, notify_client_id, client_secret } = await request.json();

    // Check if any of the required fields are missing
    if (!code || !notify_client_id || !client_secret) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Make a POST request to Line Notify's API
    const response = await fetch('https://notify-bot.line.me/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'https://system-fund.vercel.app/page/notify', // Replace with the correct redirect URI
        client_id: notify_client_id,
        client_secret,
      }),
    });

    // Handle the response from Line Notify
    if (response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify(data), { status: 200 });
    } else {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch token' }),
        { status: response.status }
      );
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { status: 500 }
    );
  }
}
