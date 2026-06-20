const mockSessions = new Map();

const createCheckoutSession = async ({ amount, name, email, description, successUrl, cancelUrl }) => {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;

  if (!secretKey) {
    // Return mock checkout redirect URL
    console.log('⚡ Paymongo secret key missing. Falling back to sandbox simulation.');
    const mockSessionId = 'cs_mock_' + Math.random().toString(36).substring(2, 15);
    
    // Store in-memory details
    mockSessions.set(mockSessionId, { status: 'unpaid', description });

    // Redirect to frontend route /mock-checkout with session parameters
    const mockCheckoutUrl = `/mock-checkout?session_id=${mockSessionId}&amount=${amount}&name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}&success_url=${encodeURIComponent(successUrl.replace('{CHECKOUT_SESSION_ID}', mockSessionId))}&cancel_url=${encodeURIComponent(cancelUrl)}`;
    return {
      id: mockSessionId,
      checkoutUrl: mockCheckoutUrl,
    };
  }

  // Real Paymongo integration
  try {
    const authHeader = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');
    
    // Paymongo amount is in cents
    const amountInCents = Math.round(amount * 100);

    const response = await fetch(
      'https://api.paymongo.com/v1/checkout_sessions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              billing: {
                name: name || 'Connectify User',
                email: email || 'user@connectify.com',
              },
              line_items: [
                {
                  amount: amountInCents,
                  currency: 'PHP',
                  name: description || 'Purchase',
                  quantity: 1,
                },
              ],
              payment_method_types: ['gcash', 'card', 'paymaya'],
              success_url: successUrl,
              cancel_url: cancelUrl,
              description: description,
            },
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'Failed to initialize payment checkout.');
    }

    return {
      id: data.data.id,
      checkoutUrl: data.data.attributes.checkout_url,
    };
  } catch (error) {
    console.error('Paymongo createCheckoutSession error:', error.message);
    throw new Error(error.message || 'Failed to initialize payment checkout.');
  }
};

const retrieveCheckoutSession = async (sessionId) => {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;

  if (!secretKey || sessionId.startsWith('cs_mock_')) {
    // Mock retrieve
    const session = mockSessions.get(sessionId) || { status: 'unpaid', description: 'Connectify Premium Subscription (1 Month)' };
    session.status = 'paid'; // Authorize on verification pull
    return {
      id: sessionId,
      status: 'paid',
      description: session.description,
    };
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');
    const response = await fetch(
      `https://api.paymongo.com/v1/checkout_sessions/${sessionId}`,
      {
        method: 'GET',
        headers: {
          Authorization: authHeader,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error('Failed to retrieve session from Paymongo.');
    }

    const attributes = data.data.attributes;
    const payments = attributes.payments || [];
    const isPaid = payments.length > 0 && payments.some(p => p.attributes.status === 'paid');

    return {
      id: data.data.id,
      status: isPaid ? 'paid' : attributes.status,
      description: attributes.description,
    };
  } catch (error) {
    console.error('Paymongo retrieveCheckoutSession error:', error.message);
    throw new Error('Failed to retrieve session from Paymongo.');
  }
};

module.exports = {
  createCheckoutSession,
  retrieveCheckoutSession,
};
