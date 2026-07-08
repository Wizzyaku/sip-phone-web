import type { VercelRequest, VercelResponse } from '@vercel/node';
import { addMessage } from '../lib/message-store.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const TELNYX_API_KEY = process.env.TELNYX_API_KEY ?? '';
const TELNYX_PHONE_NUMBER = process.env.TELNYX_PHONE_NUMBER ?? '';

function parseJsonBody(req: VercelRequest): Record<string, unknown> {
  const raw = req.body as Buffer | string | Record<string, unknown>;
  if (Buffer.isBuffer(raw)) {
    return JSON.parse(raw.toString('utf8'));
  }
  if (typeof raw === 'string') {
    return JSON.parse(raw);
  }
  return raw as Record<string, unknown>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body: Record<string, unknown>;
  try {
    body = parseJsonBody(req);
  } catch (parseErr) {
    console.error('Failed to parse body:', parseErr, 'req.body type:', typeof req.body, 'isBuffer:', Buffer.isBuffer(req.body));
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  const to = body.to as string | undefined;
  const messageBody = body.body as string | undefined;

  console.log('Send SMS request. to:', to, 'body:', messageBody);
  if (!to || !messageBody) {
    res.status(400).json({ error: 'Missing "to" or "body"' });
    return;
  }

  try {
    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: TELNYX_PHONE_NUMBER,
        to,
        text: messageBody,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Telnyx send error:', data);
      res.status(response.status).json({ error: data?.errors?.[0]?.detail || 'Telnyx request failed' });
      return;
    }

    const message = data.data;
    const record = {
      sid: message.id,
      from: message.from?.phone_number || TELNYX_PHONE_NUMBER,
      to: message.to?.[0]?.phone_number || to,
      body: message.text || messageBody,
      direction: 'outbound' as const,
      dateCreated: message.received_at || new Date().toISOString(),
      status: message.to?.[0]?.status || 'queued',
    };
    await addMessage(record);
    console.log('Outbound SMS sent:', record);

    res.status(200).json({ sid: message.id, status: record.status });
  } catch (err) {
    const error = err as Error;
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
