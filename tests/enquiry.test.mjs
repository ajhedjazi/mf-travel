import assert from 'node:assert/strict';
import { test } from 'node:test';
import { submitEnquiry } from '../app/submit-enquiry.ts';

function enquiry() {
  const data = new FormData();
  data.set('name', 'Form verification');
  data.set('contact', 'enquiries@example.com');
  data.set('pickup', 'Hull & East Riding');
  data.set('notes', 'Return journey + luggage');
  return data;
}

test('sends encoded enquiry to the static Netlify endpoint with reply-to email', async () => {
  await submitEnquiry(enquiry(), async (url, options) => {
    assert.equal(url, '/__forms.html');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['Content-Type'], 'application/x-www-form-urlencoded');
    const body = new URLSearchParams(options.body);
    assert.equal(body.get('form-name'), 'enquiry');
    assert.equal(body.get('pickup'), 'Hull & East Riding');
    assert.equal(body.get('notes'), 'Return journey + luggage');
    assert.equal(body.get('email'), 'enquiries@example.com');
    assert.ok(options.signal);
    return new Response('', { status: 200 });
  });
});

test('does not report success when Netlify rejects a submission', async () => {
  for (const status of [400, 404, 429, 500]) {
    await assert.rejects(submitEnquiry(enquiry(), async () => new Response('', { status })));
  }
});

test('network errors and timeouts remain failures, preserving the original details', async () => {
  const data = enquiry();
  for (const error of [new TypeError('Network unavailable'), new DOMException('Timed out', 'TimeoutError')]) {
    await assert.rejects(submitEnquiry(data, async () => { throw error; }));
    assert.equal(data.get('pickup'), 'Hull & East Riding');
  }
});

test('phone contacts do not become invalid reply-to email addresses', async () => {
  const data = enquiry();
  data.set('contact', '01482 000000');
  await submitEnquiry(data, async (_url, options) => {
    const body = new URLSearchParams(options.body);
    assert.equal(body.get('contact'), '01482 000000');
    assert.equal(body.has('email'), false);
    return new Response('', { status: 200 });
  });
});
