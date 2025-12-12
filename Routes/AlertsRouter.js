import { Router } from 'express';
import { listAlerts, createAlert, updateAlert, deleteAlert } from '../Controllers/AlertsController.js';
import requireRole from '../Middleware/roles.js';

const router = Router();


router.get('/', listAlerts);

router.post('/', requireRole(['admin','ngo']), createAlert);

router.put('/:id', requireRole(['admin','ngo']), updateAlert);

router.delete('/:id', requireRole(['admin']), deleteAlert);

router.get('/stream', (req, res) => {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.flushHeaders?.();

	const client = {
		id: Date.now(),
		write: (event) => {
			res.write(`data: ${JSON.stringify(event)}\n\n`);
		}
	};

	if (!global.__alertsSSE) {
		const clients = new Set();
		global.__alertsSSE = {
			clients,
			add: (c) => clients.add(c),
			remove: (c) => clients.delete(c),
			broadcast: (event) => { clients.forEach(c => c.write(event)); }
		};
	}
	global.__alertsSSE.add(client);

	const ping = setInterval(() => client.write({ type: 'ping', ts: Date.now() }), 25000);
	req.on('close', () => {
		clearInterval(ping);
		global.__alertsSSE?.remove(client);
	});
});

export default router;
