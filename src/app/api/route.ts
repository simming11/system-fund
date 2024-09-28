import { NextResponse, NextRequest } from 'next/server'

const GetCorsHeaders = (origin: string) => {

    const headers = {
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Origin': '*',
    }

    if (!process.env.ALLOWED_ORIGIN || !origin) return headers

    const allowedOrigins = process.env.ALLOWED_ORIGIN.split(',')

    if (allowedOrigins.includes('')) headers['Access-Control-Allow-Origin'] = ''

    if (allowedOrigins.includes(origin)) headers['Access-Control-Allow-Origin'] = origin

    // Return result
    return headers
}

export const OPTIONS = async (request: NextRequest) => NextResponse.json({}, { status: 200, headers: GetCorsHeaders(request.headers.get("origin") || "") })

export const GET = async (req: NextRequest) => {
    return NextResponse.json({ status: true, code: 200, message: 'Hello World' })
}