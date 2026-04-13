// Vercel Serverless Function for Hashback STK Push
// This proxies requests to Hashback API to avoid CORS issues

const API_KEY = "h26210DzY5gys";
const ACCOUNT_ID = "HP345842";
const HASHBACK_API_URL = "https://api.hashback.io/api";

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse request body if it's a string
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
    
    const { amount, msisdn, reference } = body || {};
    
    console.log('Received request:', { amount, msisdn, reference });

    if (!amount || !msisdn || !reference) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { amount, msisdn, reference }
      });
    }

    // Forward request to Hashback API
    const requestBody = {
      api_key: API_KEY,
      account_id: ACCOUNT_ID,
      amount: String(amount),
      msisdn: String(msisdn),
      reference: String(reference),
    };
    
    console.log('Forwarding to Hashback:', requestBody);

    const response = await fetch(`${HASHBACK_API_URL}/initiatestk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Hashback response status:', response.status);
    
    const data = await response.json();
    console.log('Hashback response data:', data);
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Hashback API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
