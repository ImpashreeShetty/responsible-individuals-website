exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const contentType = (event.headers['content-type'] || event.headers['Content-Type'] || '').toLowerCase();
    let body = {};
    if (contentType.includes('application/json')) {
      body = JSON.parse(event.body || '{}');
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(event.body || '');
      params.forEach((v, k) => { body[k] = v; });
    } else {
      return { statusCode: 400, body: 'Invalid content type' };
    }

    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const subject = (body.subject || '').toString().trim();
    const message = (body.message || '').toString().trim();
    const phone = (body.phone || '').toString().trim();
    const interest = (body.interest || '').toString().trim();
    const cfToken = (body.cfToken || '').toString().trim();

    if (!name || !email || !message) {
      return { statusCode: 400, body: 'Missing required fields' };
    }

    if (name.length > 200 || email.length > 320 || subject.length > 200 || message.length > 5000) {
      return { statusCode: 413, body: 'Payload too large' };
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (!cfToken) {
        return { statusCode: 400, body: 'Captcha required' };
      }
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: turnstileSecret, response: cfToken }).toString(),
      });
      const verifyJson = await verifyRes.json();
      if (!verifyJson.success) {
        return { statusCode: 400, body: 'Captcha verification failed' };
      }
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Website <no-reply@responsible-individuals.org>',
          to: ['theresponsibleindividuals@gmail.com'],
          subject: subject || `New contact from ${name}`,
          text: `Name: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ''}${interest ? `\nInterest: ${interest}` : ''}\n\n${message}`,
        }),
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error('Resend error:', t);
        return { statusCode: 502, body: 'Failed to send message' };
      }
    }

    return { statusCode: 200, body: 'Message sent' };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const contentType = (event.headers['content-type'] || event.headers['Content-Type'] || '').toLowerCase();
    let body = {};
    if (contentType.includes('application/json')) {
      body = JSON.parse(event.body || '{}');
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(event.body || '');
      params.forEach((v, k) => { body[k] = v; });
    } else {
      return { statusCode: 400, body: 'Invalid content type' };
    }

    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const subject = (body.subject || '').toString().trim();
    const message = (body.message || '').toString().trim();
    const phone = (body.phone || '').toString().trim();
    const interest = (body.interest || '').toString().trim();
    const cfToken = (body.cfToken || '').toString().trim();

    if (!name || !email || !message) {
      return { statusCode: 400, body: 'Missing required fields' };
    }

    if (name.length > 200 || email.length > 320 || subject.length > 200 || message.length > 5000) {
      return { statusCode: 413, body: 'Payload too large' };
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (!cfToken) {
        return { statusCode: 400, body: 'Captcha required' };
      }
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: turnstileSecret, response: cfToken }).toString(),
      });
      const verifyJson = await verifyRes.json();
      if (!verifyJson.success) {
        return { statusCode: 400, body: 'Captcha verification failed' };
      }
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Website <no-reply@responsible-individuals.org>',
          to: ['theresponsibleindividuals@gmail.com'],
          subject: subject || `New contact from ${name}`,
          text: `Name: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ''}${interest ? `\nInterest: ${interest}` : ''}\n\n${message}`,
        }),
      });
      if (!resp.ok) {
        const t = await resp.text();
        console.error('Resend error:', t);
        return { statusCode: 502, body: 'Failed to send message' };
      }
    }

    return { statusCode: 200, body: 'Message sent' };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};

