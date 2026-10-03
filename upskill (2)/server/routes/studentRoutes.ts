import { Router, Response } from 'express';
import { queryAll, queryOne, run } from '../db.ts';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth.ts';
import { createNotification } from '../notifications.ts';

const router = Router();

// Strictly require Student role for all endpoints in this router
router.use(authenticateToken);
router.use(requireRole('student'));

// Helper to safely parse JSON arrays
function parseJsonArray(str: string): string[] {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [str];
  } catch {
    return [str];
  }
}

// 1. Student Dashboard Overview (combining welcome, stats, highlights, and activity)
router.get('/dashboard', (req: AuthenticatedRequest, res: Response): void => {
  const studentId = req.user!.id;

  // Personal feedback count & latest 2 items
  const feedbackRows = queryAll(
    `SELECT f.id, f.subject, f.category, f.strengths, f.areas_to_improve, f.personal_comment, f.created_at, f.updated_at,
            t.first_name as teacher_first_name, t.last_name as teacher_last_name
     FROM feedback f
     JOIN users t ON f.teacher_id = t.id
     WHERE f.student_id = ?
     ORDER BY f.created_at DESC`,
    [studentId]
  );

  const formattedFeedback = feedbackRows.map(f => ({
    ...f,
    strengths: parseJsonArray(f.strengths),
    areas_to_improve: parseJsonArray(f.areas_to_improve)
  }));

  // Personal goals
  const goals = queryAll(
    `SELECT g.id, g.feedback_id, g.title, g.description, g.deadline, g.status, g.created_at, g.completed_at,
            t.first_name as teacher_first_name, t.last_name as teacher_last_name
     FROM goals g
     JOIN users t ON g.teacher_id = t.id
     WHERE g.student_id = ?
     ORDER BY 
       CASE g.status WHEN 'in_progress' THEN 1 WHEN 'not_started' THEN 2 ELSE 3 END,
       g.created_at DESC`,
    [studentId]
  );

  const activeGoalsCount = goals.filter(g => g.status !== 'completed').length;
  const completedGoalsCount = goals.filter(g => g.status === 'completed').length;

  // General observations (shared, zero student association)
  const generalObservations = queryAll(
    `SELECT o.id, o.category, o.subject, o.observation, o.created_at,
            t.first_name as teacher_first_name, t.last_name as teacher_last_name
     FROM general_observations o
     JOIN users t ON o.teacher_id = t.id
     ORDER BY o.created_at DESC`
  );

  // General goals (shared)
  const generalGoals = queryAll(
    `SELECT gg.id, gg.title, gg.description, gg.deadline, gg.status, gg.created_at,
            t.first_name as teacher_first_name, t.last_name as teacher_last_name
     FROM general_goals gg
     JOIN users t ON gg.teacher_id = t.id
     ORDER BY gg.created_at DESC`
  );

  // Recognitions for this student
  const recognitions = queryAll(
    `SELECT r.id, r.teacher_id, r.student_id, r.category, r.reason, r.created_at,
            t.first_name as teacher_first_name, t.last_name as teacher_last_name, t.subject as teacher_subject
     FROM recognitions r
     JOIN users t ON r.teacher_id = t.id
     WHERE r.student_id = ?
     ORDER BY r.created_at DESC`,
    [studentId]
  );

  // Build Recent Activity Feed
  const activityItems: Array<{
    id: string;
    type: 'feedback' | 'goal_created' | 'goal_completed' | 'general_goal' | 'general_observation' | 'recognition';
    title: string;
    description: string;
    date: string;
  }> = [];

  // 1. Feedback activities
  for (const f of formattedFeedback) {
    activityItems.push({
      id: `act-fb-${f.id}`,
      type: 'feedback',
      title: `New feedback received in ${f.subject}`,
      description: `From Teacher ${f.teacher_first_name} ${f.teacher_last_name}`,
      date: f.created_at
    });
  }

  // 2. Goal activities
  for (const g of goals) {
    activityItems.push({
      id: `act-g-${g.id}`,
      type: 'goal_created',
      title: `New goal created: "${g.title}"`,
      description: `Target deadline: ${g.deadline || 'Ongoing'}`,
      date: g.created_at
    });

    if (g.status === 'completed' && g.completed_at) {
      activityItems.push({
        id: `act-gc-${g.id}`,
        type: 'goal_completed',
        title: `Goal completed: "${g.title}"`,
        description: `Great job on finishing your milestone!`,
        date: g.completed_at
      });
    }
  }

  // 3. General goals activities
  for (const gg of generalGoals) {
    activityItems.push({
      id: `act-gg-${gg.id}`,
      type: 'general_goal',
      title: `General group goal posted: "${gg.title}"`,
      description: `For the whole student cohort`,
      date: gg.created_at
    });
  }

  // 4. General observations activities
  for (const go of generalObservations) {
    activityItems.push({
      id: `act-go-${go.id}`,
      type: 'general_observation',
      title: `General observation shared by ${go.teacher_first_name} ${go.teacher_last_name}`,
      description: `Subject: ${go.subject || 'All subjects'}`,
      date: go.created_at
    });
  }

  // 5. Recognitions
  for (const rec of recognitions) {
    activityItems.push({
      id: `act-rec-${rec.id}`,
      type: 'recognition',
      title: `Positive Recognition in ${rec.category} 🌟`,
      description: `Awarded by Teacher ${rec.teacher_first_name} ${rec.teacher_last_name}: "${rec.reason}"`,
      date: rec.created_at
    });
  }

  // Sort activities newest first
  activityItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({
    student: {
      id: req.user!.id,
      first_name: req.user!.first_name,
      last_name: req.user!.last_name,
      username: req.user!.username
    },
    counts: {
      totalFeedback: formattedFeedback.length,
      activeGoals: activeGoalsCount,
      completedGoals: completedGoalsCount,
      generalObservations: generalObservations.length,
      generalGoals: generalGoals.length,
      recognitionsCount: recognitions.length
    },
    recentFeedback: formattedFeedback.slice(0, 3),
    recentGoals: goals.slice(0, 3),
    generalObservations: generalObservations.slice(0, 3),
    generalGoals: generalGoals.slice(0, 3),
    recognitions: recognitions,
    recentActivity: activityItems.slice(0, 6)
  });
});

// 2. My Feedback Page Endpoint (STRICT PRIVACY: ONLY logged-in student)
router.get('/feedback', (req: AuthenticatedRequest, res: Response): void => {
  const studentId = req.user!.id;

  const feedbackRows = queryAll(
    `SELECT f.id, f.student_id, f.teacher_id, f.subject, f.category, f.strengths, f.areas_to_improve, f.personal_comment, f.created_at, f.updated_at,
            t.first_name as teacher_first_name, t.last_name as teacher_last_name
     FROM feedback f
     JOIN users t ON f.teacher_id = t.id
     WHERE f.student_id = ?
     ORDER BY f.created_at DESC`,
    [studentId]
  );

  const formatted = feedbackRows.map(f => ({
    id: f.id,
    student_id: f.student_id,
    teacher: `${f.teacher_first_name} ${f.teacher_last_name}`,
    subject: f.subject,
    category: f.category || 'Understanding',
    date: f.created_at,
    created_at: f.created_at,
    updated_at: f.updated_at,
    strengths: parseJsonArray(f.strengths),
    areas_to_improve: parseJsonArray(f.areas_to_improve),
    personal_comment: f.personal_comment
  }));

  res.json(formatted);
});

// 3. My Goals Page Endpoint (STRICT PRIVACY: ONLY logged-in student)
router.get('/goals', (req: AuthenticatedRequest, res: Response): void => {
  const studentId = req.user!.id;

  const goals = queryAll(
    `SELECT g.id, g.student_id, g.teacher_id, g.feedback_id, g.title, g.description, g.deadline, g.status, g.created_at, g.completed_at,
            t.first_name as teacher_first_name, t.last_name as teacher_last_name
     FROM goals g
     JOIN users t ON g.teacher_id = t.id
     WHERE g.student_id = ?
     ORDER BY 
       CASE g.status WHEN 'in_progress' THEN 1 WHEN 'not_started' THEN 2 ELSE 3 END,
       g.created_at DESC`,
    [studentId]
  );

  const formatted = goals.map(g => ({
    id: g.id,
    feedback_id: g.feedback_id,
    title: g.title,
    description: g.description,
    created_by: `${g.teacher_first_name} ${g.teacher_last_name}`,
    deadline: g.deadline,
    status: g.status,
    created_at: g.created_at,
    completed_at: g.completed_at
  }));

  res.json(formatted);
});

// 4. Update Goal Status (Student can only update status of their OWN goal)
const handleGoalStatusUpdate = (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const { status } = req.body;
  const studentId = req.user!.id;

  if (!['not_started', 'in_progress', 'completed'].includes(status)) {
    res.status(400).json({ error: 'Status must be not_started, in_progress, or completed.' });
    return;
  }

  // Ensure goal belongs to this student
  const goal = queryOne(`SELECT id, student_id, teacher_id, title FROM goals WHERE id = ?`, [id]);
  if (!goal) {
    res.status(404).json({ error: 'Goal not found.' });
    return;
  }

  if (goal.student_id !== studentId) {
    res.status(403).json({ error: 'Access denied: You can only update your own goals.' });
    return;
  }

  const completedAt = status === 'completed' ? new Date().toISOString() : null;

  run(
    `UPDATE goals SET status = ?, completed_at = ? WHERE id = ?`,
    [status, completedAt, id]
  );

  // Notify teacher when student marks milestone completed
  if (status === 'completed' && goal.teacher_id) {
    createNotification(
      goal.teacher_id,
      'goal_completed',
      'Student Milestone Reached 🎉',
      `${req.user!.first_name} ${req.user!.last_name} marked goal "${goal.title}" as completed!`,
      'goals'
    );
  }

  res.json({ success: true, id, status, completed_at: completedAt });
};

router.patch('/goals/:id/status', handleGoalStatusUpdate);
router.put('/goals/:id/status', handleGoalStatusUpdate);

// 5. General Observations Endpoint (Shared, strictly anonymous)
router.get('/general-observations', (_req: AuthenticatedRequest, res: Response): void => {
  const rows = queryAll(
    `SELECT o.id, o.category, o.subject, o.observation, o.created_at,
            t.first_name as teacher_first_name, t.last_name as teacher_last_name
     FROM general_observations o
     JOIN users t ON o.teacher_id = t.id
     ORDER BY o.created_at DESC`
  );

  const formatted = rows.map(r => ({
    id: r.id,
    category: r.category || 'General',
    subject: r.subject || 'All Subjects',
    observation: r.observation,
    teacher: `${r.teacher_first_name} ${r.teacher_last_name}`,
    created_at: r.created_at
  }));

  res.json(formatted);
});

// 6. General Goals Endpoint (Shared)
router.get('/general-goals', (_req: AuthenticatedRequest, res: Response): void => {
  const rows = queryAll(
    `SELECT gg.id, gg.title, gg.description, gg.deadline, gg.status, gg.created_at,
            t.first_name as teacher_first_name, t.last_name as teacher_last_name
     FROM general_goals gg
     JOIN users t ON gg.teacher_id = t.id
     ORDER BY gg.created_at DESC`
  );

  const formatted = rows.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    deadline: r.deadline,
    status: r.status || 'active',
    teacher: `${r.teacher_first_name} ${r.teacher_last_name}`,
    created_by: `${r.teacher_first_name} ${r.teacher_last_name}`,
    created_at: r.created_at
  }));

  res.json(formatted);
});

// 7. Recent Activity Endpoint
router.get('/activity', (req: AuthenticatedRequest, res: Response): void => {
  const studentId = req.user!.id;

  const feedbackRows = queryAll(
    `SELECT f.id, f.subject, f.created_at, t.first_name as teacher_first_name, t.last_name as teacher_last_name
     FROM feedback f
     JOIN users t ON f.teacher_id = t.id
     WHERE f.student_id = ?`,
    [studentId]
  );

  const goals = queryAll(
    `SELECT g.id, g.title, g.deadline, g.status, g.created_at, g.completed_at
     FROM goals g
     WHERE g.student_id = ?`,
    [studentId]
  );

  const generalGoals = queryAll(
    `SELECT id, title, created_at FROM general_goals`
  );

  const generalObservations = queryAll(
    `SELECT o.id, o.subject, o.created_at, t.first_name, t.last_name 
     FROM general_observations o
     JOIN users t ON o.teacher_id = t.id`
  );

  const items: Array<{
    id: string;
    type: 'feedback' | 'goal_created' | 'goal_completed' | 'general_goal' | 'general_observation';
    title: string;
    description: string;
    date: string;
  }> = [];

  for (const f of feedbackRows) {
    items.push({
      id: `act-fb-${f.id}`,
      type: 'feedback',
      title: `New feedback received in ${f.subject}`,
      description: `From Teacher ${f.teacher_first_name} ${f.teacher_last_name}`,
      date: f.created_at
    });
  }

  for (const g of goals) {
    items.push({
      id: `act-g-${g.id}`,
      type: 'goal_created',
      title: `New goal created: "${g.title}"`,
      description: `Target deadline: ${g.deadline || 'Ongoing'}`,
      date: g.created_at
    });

    if (g.status === 'completed' && g.completed_at) {
      items.push({
        id: `act-gc-${g.id}`,
        type: 'goal_completed',
        title: `Goal completed: "${g.title}"`,
        description: `Great job on finishing your milestone!`,
        date: g.completed_at
      });
    }
  }

  for (const gg of generalGoals) {
    items.push({
      id: `act-gg-${gg.id}`,
      type: 'general_goal',
      title: `General group goal posted: "${gg.title}"`,
      description: `Shared with the entire cohort`,
      date: gg.created_at
    });
  }

  for (const go of generalObservations) {
    items.push({
      id: `act-go-${go.id}`,
      type: 'general_observation',
      title: `General observation by ${go.first_name} ${go.last_name}`,
      description: `Subject: ${go.subject || 'All subjects'}`,
      date: go.created_at
    });
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json(items);
});

// 8. Student Recognitions (All recognitions received by this student)
router.get('/recognitions', (req: AuthenticatedRequest, res: Response): void => {
  const studentId = req.user!.id;
  const recognitions = queryAll(
    `SELECT r.id, r.teacher_id, r.student_id, r.category, r.reason, r.created_at,
            t.first_name as teacher_first_name, t.last_name as teacher_last_name, t.subject as teacher_subject
     FROM recognitions r
     JOIN users t ON r.teacher_id = t.id
     WHERE r.student_id = ?
     ORDER BY r.created_at DESC`,
    [studentId]
  );
  res.json(recognitions);
});

// 9. Cohort Positive Showcase (STRICT PRIVACY: ONLY positive recognitions, zero rankings, zero negative lists)
router.get('/recognitions/showcase', (_req: AuthenticatedRequest, res: Response): void => {
  const showcase = queryAll(
    `SELECT r.id, r.category, r.reason, r.created_at,
            s.first_name as student_first_name, s.last_name as student_last_name,
            t.first_name as teacher_first_name, t.last_name as teacher_last_name
     FROM recognitions r
     JOIN users s ON r.student_id = s.id
     JOIN users t ON r.teacher_id = t.id
     ORDER BY r.created_at DESC
     LIMIT 30`
  );
  res.json(showcase);
});

export default router;
