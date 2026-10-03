import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { queryAll, queryOne, run, getSetting, setSetting } from '../db.ts';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth.ts';

const router = Router();

// Strictly require Admin role for all admin routes
router.use(authenticateToken);
router.use(requireRole('admin'));

// 1. View all accounts (with search and role filter)
router.get('/users', (req: AuthenticatedRequest, res: Response): void => {
  const { role, search } = req.query;

  let sql = `
    SELECT id, first_name, last_name, username, role, subject, is_active, created_at
    FROM users
    WHERE 1=1
  `;
  const params: any[] = [];

  if (role && ['admin', 'teacher', 'student'].includes(String(role))) {
    sql += ` AND role = ?`;
    params.push(role);
  }

  if (search) {
    sql += ` AND (LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ? OR LOWER(username) LIKE ?)`;
    const term = `%${String(search).toLowerCase().trim()}%`;
    params.push(term, term, term);
  }

  sql += ` ORDER BY 
    CASE role WHEN 'admin' THEN 1 WHEN 'teacher' THEN 2 ELSE 3 END,
    last_name, first_name`;

  const users = queryAll(sql, params);
  res.json(users);
});

// 2. Create account (Student or Teacher or Admin)
router.post('/users', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { first_name, last_name, username, password, role, subject } = req.body;

  if (!first_name || !last_name || !username || !password || !role) {
    res.status(400).json({ error: 'First name, last name, username, password, and role are required.' });
    return;
  }

  if (!['admin', 'teacher', 'student'].includes(role)) {
    res.status(400).json({ error: 'Role must be admin, teacher, or student.' });
    return;
  }

  const existing = queryOne(
    `SELECT id FROM users WHERE LOWER(username) = LOWER(?)`,
    [username.trim()]
  );

  if (existing) {
    res.status(400).json({ error: 'This username is already taken. Please choose another username.' });
    return;
  }

  const id = `usr-${Math.random().toString(36).substring(2, 9)}`;
  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();

  run(
    `INSERT INTO users (id, first_name, last_name, username, password_hash, role, subject, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    [
      id,
      first_name.trim(),
      last_name.trim(),
      username.trim(),
      passwordHash,
      role,
      role === 'teacher' && subject ? subject.trim() : null,
      now
    ]
  );

  res.json({
    success: true,
    user: {
      id,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      username: username.trim(),
      role,
      subject: role === 'teacher' ? subject?.trim() : null,
      created_password: password // Sent back once so admin can view/copy and hand to the user
    }
  });
});

// 3. Enable or Disable an account
router.patch('/users/:id/status', (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (id === req.user!.id) {
    res.status(400).json({ error: 'You cannot disable your own active Admin account.' });
    return;
  }

  const user = queryOne(`SELECT id FROM users WHERE id = ?`, [id]);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const activeVal = is_active ? 1 : 0;
  run(`UPDATE users SET is_active = ? WHERE id = ?`, [activeVal, id]);

  res.json({ success: true, is_active: activeVal });
});

// 4. Change user password
router.post('/users/:id/change-password', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { new_password } = req.body;

  if (!new_password || String(new_password).trim().length < 4) {
    res.status(400).json({ error: 'New password must be at least 4 characters long.' });
    return;
  }

  const user = queryOne(`SELECT id, username FROM users WHERE id = ?`, [id]);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const passwordHash = await bcrypt.hash(new_password.trim(), 10);
  run(`UPDATE users SET password_hash = ? WHERE id = ?`, [passwordHash, id]);

  res.json({ success: true, username: user.username });
});

// 5. Delete an account safely with complete cascading and protection
router.delete('/users/:id', (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;

  // 1. Prevent deleting self
  if (id === req.user!.id) {
    res.status(400).json({ error: 'لا يمكنك حذف حساب المدير الخاص بك أثناء تسجيل الدخول به.' });
    return;
  }

  // 2. Check if user exists
  const targetUser = queryOne(`SELECT id, first_name, last_name, username, role FROM users WHERE id = ?`, [id]);
  if (!targetUser) {
    res.status(404).json({ error: 'لم يتم العثور على الحساب المطلوب حذفه.' });
    return;
  }

  // 3. Disallow deleting another Admin account
  if (targetUser.role === 'admin') {
    res.status(403).json({ error: 'لا يمكن حذف حسابات مديري النظام لدواعي الأمان.' });
    return;
  }

  // 4. Clean up related data safely according to role to ensure zero orphaned records or foreign key issues
  if (targetUser.role === 'student') {
    run(`DELETE FROM notifications WHERE user_id = ?`, [id]);
    run(`DELETE FROM recognitions WHERE student_id = ?`, [id]);
    run(`DELETE FROM goals WHERE student_id = ?`, [id]);
    run(`DELETE FROM feedback WHERE student_id = ?`, [id]);
  } else if (targetUser.role === 'teacher') {
    run(`DELETE FROM notifications WHERE user_id = ?`, [id]);
    run(`DELETE FROM teacher_suggestions WHERE teacher_id = ?`, [id]);
    run(`DELETE FROM recognitions WHERE teacher_id = ?`, [id]);
    run(`DELETE FROM general_goals WHERE teacher_id = ?`, [id]);
    run(`DELETE FROM general_observations WHERE teacher_id = ?`, [id]);
    run(`DELETE FROM goals WHERE teacher_id = ?`, [id]);
    run(`DELETE FROM feedback WHERE teacher_id = ?`, [id]);
  }

  // 5. Delete the user
  run(`DELETE FROM users WHERE id = ?`, [id]);

  res.json({
    success: true,
    message: `تم حذف حساب ${targetUser.first_name} ${targetUser.last_name} (@${targetUser.username}) بنجاح.`
  });
});

// 6. Get System Settings (Registration control, etc.)
router.get('/settings', (_req: AuthenticatedRequest, res: Response): void => {
  const allowRegistration = getSetting('allow_registration', '0') === '1';
  res.json({ allow_registration: allowRegistration });
});

// 7. Update System Settings
router.patch('/settings', (req: AuthenticatedRequest, res: Response): void => {
  const { allow_registration } = req.body;
  if (typeof allow_registration === 'boolean') {
    setSetting('allow_registration', allow_registration ? '1' : '0');
  }
  const currentVal = getSetting('allow_registration', '0') === '1';
  res.json({ success: true, allow_registration: currentVal });
});

export default router;
