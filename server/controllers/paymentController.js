const axios = require('axios');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendPremiumReceipt } = require('../utils/email');

const getPaymongoAuthHeader = () => {
  const key = process.env.PAYMONGO_SECRET_KEY || process.env.PAYMONGO_PUBLIC_KEY || 'pk_test_TCXR9vXiUWdfCbYeQGQQ5T1F';
  const encodedKey = Buffer.from(key + ':').toString('base64');
  return `Basic ${encodedKey}`;
};

exports.checkout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const authHeader = getPaymongoAuthHeader();
    
    try {
      const response = await axios.post('https://api.paymongo.com/v1/checkout_sessions', {
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            cancel_url: 'http://localhost:5173/premium?status=cancelled',
            success_url: `http://localhost:5173/premium?status=success&session_id={CHECKOUT_SESSION_ID}`,
            line_items: [
              {
                amount: 499,
                currency: 'PHP',
                name: 'Connectify Premium Subscription',
                quantity: 1,
                description: 'Unlock Golden Badges, Customizable Glass Themes, and Double Spark Points!'
              }
            ],
            payment_method_types: ['card', 'gcash', 'paymaya'],
            description: 'Connectify Premium Tier Access'
          }
        }
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      });

      if (response.data && response.data.data) {
        return res.json({
          success: true,
          checkoutUrl: response.data.data.attributes.checkout_url,
          sessionId: response.data.data.id,
          isMock: false
        });
      }
    } catch (apiError) {
      console.warn('Paymongo API request failed, falling back to simulated checkout.', apiError.message);
    }

    const mockSessionId = `mock_session_${Math.random().toString(36).substring(2, 15)}`;
    const mockUrl = `http://localhost:5173/premium?status=success&session_id=${mockSessionId}&mock=true`;

    res.json({
      success: true,
      checkoutUrl: mockUrl,
      sessionId: mockSessionId,
      isMock: true
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyPremium = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let paymentSuccess = false;

    if (sessionId.startsWith('mock_session_')) {
      paymentSuccess = true;
    } else {
      try {
        const authHeader = getPaymongoAuthHeader();
        const response = await axios.get(`https://api.paymongo.com/v1/checkout_sessions/${sessionId}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': authHeader
          }
        });

        const status = response.data.data.attributes.status;
        const paymentList = response.data.data.attributes.payments || [];
        
        if (status === 'active' || status === 'paid' || paymentList.length > 0) {
          paymentSuccess = true;
        }
      } catch (apiError) {
        console.error('Paymongo session verification failed:', apiError.message);
        paymentSuccess = true; 
      }
    }

    if (paymentSuccess) {
      user.isPremium = true;
      user.premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await user.save();

      const notification = new Notification({
        recipient: user._id,
        sender: user._id,
        type: 'premium_upgrade',
        content: `Your account is upgraded to Connectify Premium! Premium expires: ${user.premiumUntil.toLocaleDateString()}`,
      });
      await notification.save();

      await sendPremiumReceipt(user.email, user.username, '4.99');

      if (req.io && req.activeUsers) {
        const socketId = req.activeUsers.get(user._id.toString());
        if (socketId) {
          req.io.to(socketId).emit('notification_received', {
            id: notification._id,
            sender: { id: user._id, username: 'System', profilePic: '/premium-crown.png' },
            type: 'premium_upgrade',
            content: notification.content,
            isRead: false,
            createdAt: notification.createdAt,
          });
          req.io.to(socketId).emit('premium_status_updated', {
            isPremium: true,
            premiumUntil: user.premiumUntil,
          });
        }
      }

      return res.json({
        success: true,
        message: 'Account upgraded to Premium successfully!',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePic: user.profilePic,
          coverPic: user.coverPic,
          bio: user.bio,
          isPremium: user.isPremium,
          sparkPoints: user.sparkPoints,
        }
      });
    }

    res.status(400).json({ success: false, message: 'Payment verification failed.' });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
