import Sessions from '../Models/ConsultSessions.js';
import Messages from '../Models/ConsultMessages.js';
import Appointments from '../Models/Appointments.js';
import dayjs from 'dayjs';

async function translateText(text, targetLang = 'en') {
  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    console.warn('DEEPL_API_KEY is not set, skipping translation.');
    return null;
  }

  const deeplTarget = targetLang === 'ar' ? 'AR' : 'EN';

  const params = new URLSearchParams();
  params.append('auth_key', apiKey);
  params.append('text', text);
  params.append('target_lang', deeplTarget);

  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!res.ok) {
    throw new Error(`DeepL HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data.translations || !data.translations[0]) {
    throw new Error('DeepL: no translations in response');
  }

  return data.translations[0].text;
}

async function canAccessSession(sessionId, user) {
  const session = await Sessions.findById(sessionId);
  if (!session) return { allowed: false, status: 404, message: 'Not found' };

  if (user.role === 'admin') {
    return { allowed: true, session };
  }

  if (user.role === 'nurse') {
    return { allowed: false, status: 403, message: 'Nurse forbidden' };
  }

  const appt = await Appointments.findFullById(session.appointment_id);
  if (!appt) {
    return { allowed: false, status: 404, message: 'Appointment not found' };
  }

  if (user.role === 'doctor' && appt.doctor_user_id === user.id) {
    return { allowed: true, session };
  }

  if (user.role === 'patient' && appt.patient_user_id === user.id) {
    return { allowed: true, session };
  }

  return { allowed: false, status: 403, message: 'Forbidden' };
}

export const createSession = async (req, res, next) => {
  try {
    const { appointment_id } = req.body;
    const { id: userId, role } = req.user;

    const appt = await Appointments.findFullById(appointment_id);
    if (!appt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (role === 'nurse') {
      return res.status(403).json({ message: 'Nurse cannot create sessions' });
    }

    if (role === 'patient') {
      if (appt.patient_user_id !== userId) {
        return res
          .status(403)
          .json({ message: 'Appointment does not belong to this patient' });
      }
    } else if (role === 'doctor') {
      if (appt.doctor_user_id !== userId) {
        return res
          .status(403)
          .json({ message: 'Appointment does not belong to this doctor' });
      }
    } else if (role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const s = await Sessions.insert(req.body);
    res.status(201).json(s);
  } catch (e) {
    next(e);
  }
};

export const getSession = async (req, res, next) => {
  try {
    const check = await canAccessSession(req.params.id, req.user);
    if (!check.allowed) {
      return res.status(check.status).json({ message: check.message });
    }
    res.json(check.session);
  } catch (e) {
    next(e);
  }
};

export const listSessions = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;

    let rows;
    if (role === 'admin') {
      rows = await Sessions.find(req.query);
    } else if (role === 'doctor') {
      rows = await Sessions.findForDoctor(userId);
    } else if (role === 'patient') {
      rows = await Sessions.findForPatient(userId);
    } else if (role === 'nurse') {
      return res
        .status(403)
        .json({ message: 'Nurse cannot list all sessions' });
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(rows);
  } catch (e) {
    next(e);
  }
};

export const startSession = async (req, res, next) => {
  try {
    const check = await canAccessSession(req.params.id, req.user);
    if (!check.allowed) {
      return res.status(check.status).json({ message: check.message });
    }

    if (req.user.role === 'patient' || req.user.role === 'nurse') {
      return res
        .status(403)
        .json({ message: 'Only doctor or admin can start session' });
    }

    const row = await Sessions.markStarted(
      req.params.id,
      dayjs().format('YYYY-MM-DD HH:mm:ss')
    );
    res.json(row);
  } catch (e) {
    next(e);
  }
};

export const endSession = async (req, res, next) => {
  try {
    const check = await canAccessSession(req.params.id, req.user);
    if (!check.allowed) {
      return res.status(check.status).json({ message: check.message });
    }

    const row = await Sessions.markEnded(
      req.params.id,
      dayjs().format('YYYY-MM-DD HH:mm:ss')
    );
    res.json(row);
  } catch (e) {
    next(e);
  }
};

export const createMessage = async (req, res, next) => {
  try {
    const {
      appointment_id,
      sender_user_id,
      message,
      attachment_url,
      auto_translate,
      target_lang,
    } = req.body;

    let translated = null;

    if (auto_translate) {
      const lang = target_lang === 'ar' ? 'ar' : 'en';
      try {
        translated = await translateText(message, lang);
      } catch (err) {
        console.error('Translation failed:', err.message);
      }
    }

    const msg = await Messages.insert({
      appointment_id,
      sender_user_id,
      message,
      attachment_url: attachment_url || null,
    });

    res.status(201).json({ ...msg, translated_text: translated });
  } catch (e) {
    next(e);
  }
};

export const listMessages = async (req, res, next) => {
  try {
    const { appointment_id } = req.query;
    const rows = await Messages.findByAppointment(appointment_id);
    res.json(rows);
  } catch (e) {
    next(e);
  }
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

