module.exports = async (request, response) => {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    return response.status(204).end();
  }

  const { eventName, eventId, eventSourceUrl, customData } = request.body || {};
  const supportedEvents = ['ViewContent', 'BookingClickout'];

  if (!supportedEvents.includes(eventName) || !eventId || !eventSourceUrl) {
    return response.status(400).json({ error: 'Invalid event payload' });
  }

  const forwardedFor = request.headers['x-forwarded-for'];
  const clientIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]?.trim();
  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: eventSourceUrl,
    action_source: 'website',
    user_data: {
      client_ip_address: clientIp,
      client_user_agent: request.headers['user-agent']
    },
    custom_data: customData || {}
  };

  const graphResponse = await fetch(`https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [event],
      ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {})
    })
  });

  if (!graphResponse.ok) {
    return response.status(502).json({ error: 'Meta Conversions API request failed' });
  }

  return response.status(200).json({ received: true });
};
