import { NextResponse, NextRequest } from 'next/server';

// Helper function to get CORS headers
const GetCorsHeaders = (origin: string) => {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Origin': 'https://mis.csit.scidi.tsu.ac.th/642021164', // Default to '*', change as needed
  };

  // Check if there is an allowed origin in the environment variable
  if (!process.env.ALLOWED_ORIGIN || !origin) return headers;

  const allowedOrigins = process.env.ALLOWED_ORIGIN.split(',');

  // Only set CORS headers for valid origins
  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
};

export async function OPTIONS(request: Request) {
    const allowedOrigin = request.headers.get("origin");
    const response = new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin || "https://mis.csit.scidi.tsu.ac.th/642021164",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
        "Access-Control-Max-Age": "86400",
      },
    });
  
    return response;
  }

// Handle the POST request to obtain the token
export async function POST(request: Request) {
  try {
    // Extract necessary values from the request body
    const { code, notify_client_id, client_secret } = await request.json();

    // Validate required fields
    if (!code || !notify_client_id || !client_secret) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Make the POST request to LINE Notify API
    const response = await fetch('https://notify-bot.line.me/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'https://system-fund.vercel.app/page/notify', // Replace with your correct redirect URI
        client_id: notify_client_id,
        client_secret,
      }),
    });

    // Check if the response from LINE Notify API is successful
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
    // Handle any unexpected server errors
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { status: 500 }
    );
  }
}
