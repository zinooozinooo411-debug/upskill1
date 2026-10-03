import { Router, Response } from 'express';
import { queryAll, queryOne, run } from '../db.ts';
import { authenticateToken, AuthenticatedRequest } from '../auth.ts';
import { checkAndGenerateDeadlineNotifications } from '../notifications.ts';

const router = Router();

// Apply auth middleware to all notification endpoints
router.use(authenticateToken);

// 1. Get user notifications
router.get('/', (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;

  // If user is a student, automatically check for approaching deadlines
  if (req.user!.role === 'student') {
    checkAndGenerateDeadlineNotifications(userId);
  }

  const rows = queryAll(
    `SELECT id, user_id, type, title, message, read, link, created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId]
  );

  const notifications = rows.map(r => ({
    id: r.id,
    user_id: r.user_id,
    type: r.type,
    title: r.title,
    message: r.message,
    read: Boolean(r.read),
    link: r.link,
    created_at: r.created_at
  }));

  const unreadCount = notifications.filter(n => !n.read).length;

  res.json({
    notifications,
    unread_count: unreadCount
  });
});

// 2. Mark single notification as read
router.patch('/:id/read', (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = queryOne(`SELECT id, user_id FROM notifications WHERE id = ?`, [id]);
  if (!existing) {
    res.status(404).json({ error: 'Notification not found.' });
    return;
  }

  if (existing.user_id !== userId) {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  run(`UPDATE notifications SET read = 1 WHERE id = ?`, [id]);
  res.json({ success: true, id });
});

// 3. Mark all notifications as read
router.post('/mark-all-read', (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;

  run(`UPDATE notifications SET read = 1 WHERE user_id = ?`, [userId]);
  res.json({ success: true });
});

// 4. Delete notification
router.delete('/:id', (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = queryOne(`SELECT id, user_id FROM notifications WHERE id = ?`, [id]);
  if (!existing) {
    res.status(404).json({ error: 'Notification not found.' });
    return;
  }

  if (existing.user_id !== userId) {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  run(`DELETE FROM notifications WHERE id = ?`, [id]);
  res.json({ success: true });
});

export default router;
