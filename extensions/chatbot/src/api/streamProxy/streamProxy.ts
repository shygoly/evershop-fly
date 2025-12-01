// @ts-nocheck
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export default async function streamProxy(request: Request, response: Response) {
  try {
    const { message, userId, userRole = 'visitor', shopId } = request.body || {};

    if (!message || !userId) {
      response.status(400).json({ error: 'message and userId are required' });
      return;
    }

    const baseURL = process.env.CHATBOT_NODE_URL || 'http://localhost:3000';
    const ssoSecret = process.env.CHATBOT_SSO_SECRET;
    const tenantShopId = shopId || process.env.CHATBOT_SHOP_ID || '';

    if (!tenantShopId || !ssoSecret) {
      response.status(500).json({ error: 'Chatbot server not configured' });
      return;
    }

    const token = jwt.sign(
      {
        shopId: tenantShopId,
        role: 'admin'
      },
      ssoSecret,
      {
        issuer: 'shopsaas',
        audience: 'chatbot-node',
        expiresIn: '1h'
      }
    );

    const cozeResp = await fetch(`${baseURL}/api/coze/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shopId: tenantShopId,
        message,
        userId,
        userRole
      })
    });

    if (!cozeResp.ok || !cozeResp.body) {
      response.status(cozeResp.status).json({ error: 'Upstream chat error' });
      return;
    }

    response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');

    const reader = cozeResp.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      response.write(chunk);
    }

    response.end();
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('streamProxy error:', err?.message || err);
    try {
      response.write(`data: ${JSON.stringify({ type: 'error', message: 'Proxy error' })}\n\n`);
    } catch {}
    response.end();
  }
}



