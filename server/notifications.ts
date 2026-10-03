import { run, queryAll, queryOne } from './db.ts';

export function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
): string {
  const id = `notif-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();
  run(
    `INSERT INTO notifications (id, user_id, type, title, message, read, link, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
    [id, userId, type, title, message, link || null, now]
  );
  return id;
}

export function checkAndGenerateDeadlineNotifications(studentId: string): void {
  try {
    const now = new Date();
    // Goals due within 3 days (approx 72 hours)
    const threeDaysAhead = new Date(now.getTime() + 3 * 86400000);
    const nowStr = now.toISOString().split('T')[0];
    const threeDaysStr = threeDaysAhead.toISOString().split('T')[0];

    const goalsDueSoon = queryAll(
      `SELECT id, title, deadline FROM goals 
       WHERE student_id = ? AND status != 'completed' AND deadline IS NOT NULL AND deadline >= ? AND deadline <= ?`,
      [studentId, nowStr, threeDaysStr]
    );

    for (const g of goalsDueSoon) {
      // Avoid duplicate approaching notifications for the same goal
      const existing = queryOne(
        `SELECT id FROM notifications 
         WHERE user_id = ? AND type = 'goal_deadline' AND message LIKE ?`,
        [studentId, `%${g.title}%`]
      );
      if (!existing) {
        createNotification(
          studentId,
          'goal_deadline',
          'Goal Deadline Approaching ⏳',
          `Reminder: Goal "${g.title}" is due on ${g.deadline}.`,
          'goals'
        );
      }
    }
  } catch (err) {
    console.error('Error generating deadline notifications:', err);
  }
}
