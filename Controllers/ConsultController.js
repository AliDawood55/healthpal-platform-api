import Sessions from '../Models/ConsultSessions.js';
import Messages from '../Models/ConsultMessages.js';
import dayjs from 'dayjs';

let translate;
try {
    const module = await import('@vitalets/google-translate-api');
    translate = module.default;
} catch {
}

export const createSession = async (req, res, next) => {
    try {
        const s = await Sessions.insert(req.body);
        res.status(201).json(s);
    } catch (e) { next(e); }
};

export const getSession = async (req, res, next) => {
    try {
        const row = await Sessions.findById(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (e) { next(e); }
};

export const listSessions = async (req, res, next) => {
    try {
        const rows = await Sessions.find(req.query);
        res.json(rows);
    } catch (e) { next(e); }
};

export const startSession = async (req, res, next) => {
    try {
        const row = await Sessions.markStarted(
            req.params.id,
            dayjs().format('YYYY-MM-DD HH:mm:ss')
        );
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (e) { next(e); }
};

export const endSession = async (req, res, next) => {
    try {
        const row = await Sessions.markEnded(
            req.params.id,
            dayjs().format('YYYY-MM-DD HH:mm:ss')
        );
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (e) { next(e); }
};

export const createMessage = async (req, res, next) => {
    try {
        const { appointment_id, sender_user_id, message, attachment_url, auto_translate, target_lang } = req.body;

        let translated = null;

        if (auto_translate && translate) {
            try {
                const r = await translate(message, {
                    to: target_lang === 'en' ? 'en' : 'ar'
                });
                translated = r.text;
            } catch {
            }
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

export const listMessages = async (req, res, next) => {
    try {
        const { appointment_id } = req.query;
        const rows = await Messages.findByAppointment(appointment_id);
        res.json(rows);
    } catch (e) { next(e); }
};

export default {
    createSession,
    getSession,
    listSessions,
    startSession,
    endSession,
    createMessage,
    listMessages,
};

