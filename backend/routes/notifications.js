import express from 'express';
import { sendEmail, sendWhatsApp, sendSms } from '../utils/notifications.js';

const router = express.Router();

// POST /api/notifications/email
router.post('/email', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    if (!to) return res.status(400).json({ error: 'Missing to' });
    const result = await sendEmail({ to, subject, text, html });
    res.json({ ok: true, channel: 'email', result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/notifications/whatsapp
router.post('/whatsapp', async (req, res) => {
  try {
    const { to, body } = req.body;
    if (!to || !body) return res.status(400).json({ error: 'Missing to or body' });
    const result = await sendWhatsApp({ to, body });
    res.json({ ok: true, channel: 'whatsapp', result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/notifications/sms
router.post('/sms', async (req, res) => {
  try {
    const { to, body } = req.body;
    if (!to || !body) return res.status(400).json({ error: 'Missing to or body' });
    const result = await sendSms({ to, body });
    res.json({ ok: true, channel: 'sms', result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;