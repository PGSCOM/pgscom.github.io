export const onRequestPost: PagesFunction = async ({ request, env }) => {
  console.log('📨 Recibiendo petición de contacto...');
  
  try {
    const contentType = request.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);
    let data: Record<string, string> = {};

    if (contentType.includes('application/json')) {
      data = await request.json();
      console.log('✅ Datos JSON parseados');
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await request.formData();
      data = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
      console.log('✅ Datos form-data parseados');
    } else {
      console.error('❌ Content-type no soportado:', contentType);
      return new Response(JSON.stringify({ ok: false, error: 'Unsupported content type' }), {
        status: 415,
        headers: { 'content-type': 'application/json' },
      });
    }

    const { nombre, email, asunto, mensaje } = data;
    console.log('Datos recibidos:', { nombre, email, asunto, mensajeLength: mensaje?.length });
    
    if (!nombre || !email || !asunto || !mensaje) {
      console.error('❌ Campos faltantes');
      return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Email inválido:', email);
      return new Response(JSON.stringify({ ok: false, error: 'Invalid email' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Enviar mensaje via Telegram Bot
    console.log('🔍 Verificando variables de Telegram...');
    console.log('TELEGRAM_BOT_TOKEN presente:', !!env.TELEGRAM_BOT_TOKEN);
    console.log('TELEGRAM_CHAT_ID presente:', !!env.TELEGRAM_CHAT_ID);
    
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      console.error('❌ Variables de entorno de Telegram NO configuradas');
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'Telegram no configurado. Contacta al administrador.' 
      }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    const tgApi = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const text = [
      `✨ Nuevo contacto en PGSCOM`,
      ``,
      `👤 Nombre: ${nombre}`,
      `📧 Email: ${email}`,
      `📝 Asunto: ${asunto}`,
      ``,
      `💬 Mensaje:`,
      `${mensaje}`,
      ``,
      `🕐 ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}`,
    ].join('\n');

    console.log('📤 Enviando mensaje a Telegram...');
    const tgResp = await fetch(tgApi, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        disable_web_page_preview: true,
      }),
    });

    const tgData = await tgResp.json();
    console.log('Respuesta de Telegram:', { status: tgResp.status, ok: tgData.ok });

    if (!tgResp.ok || !tgData.ok) {
      console.error('❌ Error de Telegram:', JSON.stringify(tgData));
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'Error al enviar mensaje a Telegram' 
      }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    console.log('✅ Mensaje enviado exitosamente a Telegram');
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error en la función:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: 'Server error',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
