export async function GET(request: Request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': 'https://notify-bot.line.me,https://77a4-180-180-225-124.ngrok-free.app,https://notify-api.line.me/api/notify',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
  
    // สำหรับ GET หรือ POST
    return new Response('Hello, Next.js!', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://notify-bot.line.me,https://77a4-180-180-225-124.ngrok-free.app,https://notify-api.line.me/api/notify',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  