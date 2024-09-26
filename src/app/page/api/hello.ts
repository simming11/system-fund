export async function GET(request: Request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': 'https://mis.csit.scidi.tsu.ac.th/642021164',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
  
    // สำหรับ GET หรือ POST
    return new Response('Hello, Next.js!', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://mis.csit.scidi.tsu.ac.th/642021164',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  