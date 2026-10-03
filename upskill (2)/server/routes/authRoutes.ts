import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { queryAll, queryOne, run, getSetting } from '../db.ts';
import { generateToken, authenticateToken, AuthenticatedRequest, AuthUser } from '../auth.ts';

const router = Router();

// Check if student registration is permitted by administration
router.get('/registration-status', (_req, res) => {
  const allowed = getSetting('allow_registration', '0') === '1';
  res.json({ allowed });
});

// Student Self-Registration (Only available when allowed by Admin)
router.post('/register', async (req, res): Promise<void> => {
  const allowed = getSetting('allow_registration', '0') === '1';
  if (!allowed) {
    res.status(403).json({ error: 'التسجيل الذاتي للطلاب مغلق حالياً من قِبل إدارة المدرسة.' });
    return;
  }

  const { first_name, last_name, username, password } = req.body;

  if (!first_name || !last_name || !username || !password) {
    res.status(400).json({ error: 'يرجى ملء جميع الحقول المطلوبة (الاسم الأول، اسم العائلة، اسم المستخدم، كلمة المرور).' });
    return;
  }

  const trimmedUsername = username.trim().toLowerCase();
  if (trimmedUsername.length < 3) {
    res.status(400).json({ error: 'اسم المستخدم يجب أن يحتوي على 3 أحرف على الأقل.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'كلمة المرور يجب أن تتكون من 6 خانات على الأقل.' });
    return;
  }

  const existingUser = queryOne('SELECT id FROM users WHERE LOWER(username) = ?', [trimmedUsername]);
  if (existingUser) {
    res.status(400).json({ error: 'اسم المستخدم مستخدم بالفعل. يرجى اختيار اسم مستخدم آخر.' });
    return;
  }

  const id = `usr-st-${Math.random().toString(36).substring(2, 9)}`;
  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();

  // Public registration is STRICTLY for 'student' role only!
  run(
    `INSERT INTO users (id, first_name, last_name, username, password_hash, role, subject, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, 'student', NULL, 1, ?)`,
    [id, first_name.trim(), last_name.trim(), trimmedUsername, passwordHash, now]
  );

  const authUser: AuthUser = {
    id,
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    username: trimmedUsername,
    role: 'student',
    subject: null,
    is_active: 1
  };

  const token = generateToken(authUser);

  res.json({
    token,
    user: authUser
  });
});

// Login endpoint (Username + Password)
router.post('/login', async (req, res): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Please enter both username and password.' });
    return;
  }

  const user = queryOne(
    `SELECT id, first_name, last_name, username, password_hash, role, subject, is_active, created_at 
     FROM users 
     WHERE LOWER(username) = LOWER(?)`,
    [username.trim()]
  );

  if (!user) {
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  if (user.is_active === 0) {
    res.status(403).json({ error: 'This account has been disabled by an administrator.' });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  const authUser: AuthUser = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    role: user.role,
    subject: user.subject,
    is_active: user.is_active
  };

  const token = generateToken(authUser);

  res.json({
    token,
    user: authUser
  });
});

// Check if initial admin account setup is needed
router.get('/setup-status', (_req, res) => {
  const admin = queryOne('SELECT id FROM users WHERE role = ? LIMIT 1', ['admin']);
  res.json({ needsSetup: !admin });
});

// Setup Initial Admin account (First Launch only - permanently locked once created)
router.post('/setup-initial-admin', async (req, res): Promise<void> => {
  const existingAdmin = queryOne('SELECT id FROM users WHERE role = ? LIMIT 1', ['admin']);
  if (existingAdmin) {
    res.status(403).json({ error: 'تم إعداد النظام مسبقاً. إعداد أول مدير مغلق نهائياً.' });
    return;
  }

  const { first_name, last_name, username, password } = req.body;

  if (!first_name || !last_name || !username || !password) {
    res.status(400).json({ error: 'يرجى تعبئة جميع الحقول المطلوبة (الاسم الأول، اسم العائلة، اسم المستخدم، كلمة المرور).' });
    return;
  }

  const trimmedUsername = username.trim().toLowerCase();
  if (trimmedUsername.length < 3) {
    res.status(400).json({ error: 'اسم المستخدم يجب أن يحتوي على 3 أحرف على الأقل.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'كلمة المرور يجب أن تكون قوية وتحتوي على 6 خانات على الأقل.' });
    return;
  }

  const existingUser = queryOne('SELECT id FROM users WHERE LOWER(username) = ?', [trimmedUsername]);
  if (existingUser) {
    res.status(400).json({ error: 'اسم المستخدم هذا مستخدم بالفعل. يرجى اختيار اسم مستخدم آخر.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = `usr-admin-${Date.now()}`;
  const now = new Date().toISOString();

  run(
    `INSERT INTO users (id, first_name, last_name, username, password_hash, role, subject, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, 'admin', NULL, 1, ?)`,
    [id, first_name.trim(), last_name.trim(), trimmedUsername, passwordHash, now]
  );

  const authUser: AuthUser = {
    id,
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    username: trimmedUsername,
    role: 'admin',
    subject: null,
    is_active: 1
  };

  const token = generateToken(authUser);

  res.json({
    token,
    user: authUser
  });
});

// Current user details
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = queryOne(
    `SELECT id, first_name, last_name, username, role, subject, is_active, created_at
     FROM users
     WHERE id = ?`,
    [req.user.id]
  );

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
});

export default router;
