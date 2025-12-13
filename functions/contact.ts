export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    let data: Record<string, string> = {};

    if (contentType.includes('application/json')) {
      data = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await request.formData();
      data = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
    } else {
      return new Response(JSON.stringify({ ok: false, error: 'Unsupported content type' }), {
        status: 415,
        headers: { 'content-type': 'application/json' },
      });
    }

    const { nombre, email, asunto, mensaje } = data;
    if (!nombre || !email || !asunto || !mensaje) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid email' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Option A: Store as CSV line in R2 bucket (recommended for simple logging)
    // Requires binding: env.CONTACT_BUCKET (R2)
    // Filename format: YYYY/MM/DD/contact.csv
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');
    const path = `${yyyy}/${mm}/${dd}/contact.csv`;
    const csvLine = `${JSON.stringify({ timestamp: now.toISOString(), nombre, email, asunto, mensaje }).replace(/\n/g, ' ')}\n`;

    if (env.CONTACT_BUCKET) {
      // Append-like: read existing, then write new content
      try {
        const existing = await env.CONTACT_BUCKET.get(path);
        const prev = existing ? await existing.text() : '';
        await env.CONTACT_BUCKET.put(path, prev + csvLine, { httpMetadata: { contentType: 'text/csv' } });
      } catch (err) {
        // If bucket not accessible, continue to next option
      }
    }

    // Option B: Send email via MailChannels (built-in on Cloudflare)
    // Requires proper from domain. Configure env.MAIL_TO and env.MAIL_FROM.
    if (env.MAIL_TO && env.MAIL_FROM) {
      const mailPayload = {
        personalizations: [{ to: [{ email: env.MAIL_TO }] }],
        from: { email: env.MAIL_FROM },
        subject: `Nuevo contacto: ${asunto}`,
        content: [
          {
            type: 'text/plain',
            value: `Nombre: ${nombre}\nEmail: ${email}\nAsunto: ${asunto}\n\nMensaje:\n${mensaje}`,
          },
        ],
      };
      const resp = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(mailPayload),
      });
      // Ignore non-200 for now; still continue
    }

    // Option C: Send message via Telegram Bot
    // Requires env.TELEGRAM_BOT_TOKEN and env.TELEGRAM_CHAT_ID
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      const tgApi = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const text = [
        `✨ Nuevo contacto en PGSCOM`,
        `Nombre: ${nombre}`,
        `Email: ${email}`,
        `Asunto: ${asunto}`,
        `Mensaje:`,
        `${mensaje}`,
        `\n@ ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}`,
      ].join('\n');

      const tgResp = await fetch(tgApi, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });

      // If Telegram fails, do not block the request; we already have R2/email fallback
      // Optionally, you could log tgResp.status
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: 'Server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
