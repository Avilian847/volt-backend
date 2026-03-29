const axios = require('axios');
require('dotenv').config();

// ── Get access token ──────────────────────────────────────────
const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const res = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return res.data.access_token;
};

// ── STK Push ──────────────────────────────────────────────────
const stkPush = async (req, res) => {
  const { phone, amount, orderId } = req.body;

  if (!phone || !amount || !orderId) {
    return res.status(400).json({ error: 'Phone, amount and orderId are required' });
  }

  try {
    const token = await getAccessToken();

    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    // Format phone — remove leading 0 and add 254
    const formattedPhone = phone.startsWith('0')
      ? '254' + phone.slice(1)
      : phone;

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount),
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: `VoltHive-${orderId}`,
        TransactionDesc: 'VoltHive Order Payment'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({
      message: 'STK Push sent. Enter your M-Pesa PIN on your phone.',
      data: response.data
    });

  } catch (err) {
    console.error('STK Push error:', err.response?.data || err.message);
    res.status(500).json({ error: 'M-Pesa request failed' });
  }
};

// ── M-Pesa Callback ───────────────────────────────────────────
const mpesaCallback = async (req, res) => {
  const callback = req.body.Body?.stkCallback;

  if (!callback) {
    return res.status(400).json({ error: 'Invalid callback' });
  }

  const { ResultCode, ResultDesc, CallbackMetadata } = callback;

  if (ResultCode === 0) {
    // Payment successful
    const items = CallbackMetadata.Item;
    const amount    = items.find(i => i.Name === 'Amount')?.Value;
    const mpesaCode = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const phone     = items.find(i => i.Name === 'PhoneNumber')?.Value;

    console.log(`Payment successful — Amount: ${amount}, Code: ${mpesaCode}, Phone: ${phone}`);

    // TODO: Update order status in DB using mpesaCode
  } else {
    console.log(`Payment failed — ${ResultDesc}`);
  }

  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
};

module.exports = { stkPush, mpesaCallback };