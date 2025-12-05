// User-related validation schemas using zod
import { z } from 'zod';

export const createUserSchema = z.object({
	name: z.string().min(1, 'Name is required').max(150),
	email: z.string().email('Invalid email').max(200),
	password: z.string().min(6, 'Password must be at least 6 characters').max(255)
});

export const updateUserSchema = z.object({
	name: z.string().min(1).max(150).optional(),
	email: z.string().email().max(200).optional(),
	password: z.string().min(6).max(255).optional()
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export function validate(schema, data) {
	const result = schema.safeParse(data);
	if (!result.success) {
		return { ok: false, errors: result.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) };
	}
	return { ok: true, data: result.data };
}

// Alerts
export const createAlertSchema = z.object({
	title: z.string().min(3).max(200),
	message: z.string().min(3).max(2000),
	severity: z.enum(['info', 'warning', 'critical']),
	region: z.string().max(120).optional()
});

export const updateAlertSchema = z.object({
	title: z.string().min(3).max(200).optional(),
	message: z.string().min(3).max(2000).optional(),
	severity: z.enum(['info', 'warning', 'critical']).optional(),
	region: z.string().max(120).optional()
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field is required' });

// Health guides
export const createGuideSchema = z.object({
	title: z.string().min(3).max(200),
	category: z.enum(['first_aid','chronic_care','nutrition','maternal','mental_health','general']),
	language: z.enum(['ar','en']).optional(),
	content: z.string().min(10).max(10000)
});

export const updateGuideSchema = z.object({
	title: z.string().min(3).max(200).optional(),
	category: z.enum(['first_aid','chronic_care','nutrition','maternal','mental_health','general']).optional(),
	language: z.enum(['ar','en']).optional(),
	content: z.string().min(10).max(10000).optional()
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field is required' });


