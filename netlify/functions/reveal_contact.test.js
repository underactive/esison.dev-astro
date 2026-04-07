import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handler } from './reveal_contact.js';

describe('reveal_contact handler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    process.env = { ...originalEnv };
    process.env.TURNSTILE_SECRET = 'test-secret';
    process.env.CONTACT_EMAIL = 'test@example.com';
    process.env.CONTACT_PHONE = '+1234567890';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = originalEnv;
  });

  const createEvent = (body, headers = {}) => ({
    body: JSON.stringify(body),
    headers: { 'client-ip': '127.0.0.1', ...headers }
  });

  it('rejects if honeypot is filled', async () => {
    const event = createEvent({ honeypot: 'bot-data' });
    const res = await handler(event);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({ error: 'bot-detected' });
  });

  it('rejects if response time is too fast', async () => {
    const event = createEvent({ tNow: 1000 });
    const res = await handler(event);
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({ error: 'too-fast' });
  });

  it('rejects invalid primary turnstile token', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ success: false }) });
    const event = createEvent({ token: 'invalid-token', tNow: 2000 });
    const res = await handler(event);
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBe('captcha-invalid');
    expect(body.stage).toBe('primary');
  });

  it('returns email on valid primary turnstile token', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true }) });
    const event = createEvent({ token: 'valid-token', tNow: 2000 });
    const res = await handler(event);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ email: 'test@example.com', phone: null });
  });

  it('returns both email and phone on valid primary and secondary tokens', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true }) }); // primary
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true }) }); // secondary
    const event = createEvent({ token: 'valid-token', includePhone: true, phoneToken: 'valid-phone-token', tNow: 2000 });
    const res = await handler(event);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ email: 'test@example.com', phone: '+1234567890' });
  });

  it('returns email with phone withheld if secondary token is invalid', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true }) }); // primary
    fetch.mockResolvedValueOnce({ json: async () => ({ success: false }) }); // secondary
    const event = createEvent({ token: 'valid-token', includePhone: true, phoneToken: 'invalid-phone-token', tNow: 2000 });
    const res = await handler(event);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ 
      email: 'test@example.com', 
      phone: null,
      meta: { phoneWithheld: true, reason: 'secondary-verification-failed' }
    });
  });

  it('handles phone-only request correctly', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true }) }); // secondary
    const event = createEvent({ token: '', includePhone: true, phoneToken: 'valid-phone-token', tNow: 2000 });
    const res = await handler(event);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ phone: '+1234567890' });
  });

  it('rejects phone-only request with invalid token', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ success: false }) }); // secondary
    const event = createEvent({ token: '', includePhone: true, phoneToken: 'invalid-phone-token', tNow: 2000 });
    const res = await handler(event);
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBe('captcha-invalid');
    expect(body.stage).toBe('secondary');
  });

  it('handles missing contact info gracefully', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true }) });
    delete process.env.CONTACT_EMAIL;
    const event = createEvent({ token: 'valid-token', tNow: 2000 });
    const res = await handler(event);
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toEqual({ error: 'missing-contact-info' });
  });
});