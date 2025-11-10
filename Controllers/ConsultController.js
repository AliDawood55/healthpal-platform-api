const Sessions = require('../Models/ConsultSessions.js');
const Messages = require('../Models/ConsultMessages');
const dayjs = require('dayjs');
let translate;
try { translate = require('@vitalets/google-translate-api'); } catch { /* optional */ }

exports.createSession = async (req, res, next) => {
    try {
        const s = await Sessions.insert(req.body); // {appointment_id, mode, signaling_url?, room_token?}
        res.status(201).json(s);
    } catch (e) { next(e); }
};

exports.getSession = async (req, res, next) => {
    try {
        const row = await Sessions.findById(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (e) { next(e); }
};

exports.listSessions = async (req, res, next) => {
    try {
        const rows = await Sessions.find(req.query); // filters: appointment_id, mode
        res.json(rows);
    } catch (e) { next(e); }
};

exports.startSession = async (req, res, next) => {
    try {
        const row = await Sessions.markStarted(req.params.id, dayjs().format('YYYY-MM-DD HH:mm:ss'));
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (e) { next(e); }
};

exports.endSession = async (req, res, next) => {
    try {
        const row = await Sessions.markEnded(req.params.id, dayjs().format('YYYY-MM-DD HH:mm:ss'));
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (e) { next(e); }
};

// messages
exports.createMessage = async (req, res, next) => {
    try {
        const { appointment_id, sender_user_id, message, attachment_url, auto_translate, target_lang } = req.body;

        let translated = null;
        if (auto_translate && translate) {
        try {
            const r = await translate(message, { to: target_lang === 'en' ? 'en' : 'ar' });
            translated = r.text;
        } catch { /* ignore translation failure */ }
        }

        const msg = await Messages.insert({
            appointment_id,
            sender_user_id,
            message,
            attachment_url: attachment_url || null
        });

        res.status(201).json({ ...msg, translated_text: translated });
    } catch (e) { next(e); }
};

exports.listMessages = async (req, res, next) => {
    try {
        const { appointment_id } = req.query;
        const rows = await Messages.findByAppointment(appointment_id);
        res.json(rows);
    } catch (e) { next(e); }
};
