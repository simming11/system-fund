import { NextApiRequest, NextApiResponse } from 'next';

const allowCors = (fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) =>
    async (req: NextApiRequest, res: NextApiResponse) => {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Origin', '*'); // Update this with your domain
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Authorization, Content-Type, Accept-Version, Content-Length, Origin'
        );

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        return await fn(req, res);
    };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json({ message: 'Hello World' });
};

export default allowCors(handler);