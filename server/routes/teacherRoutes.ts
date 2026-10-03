import { Router, Response } from 'express';
import { queryAll, queryOne, run } from '../db.ts';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth.ts';
import { createNotification } from '../notifications.ts';

const router = Router();

// Strictly require Teacher or Admin role for teacher routes
router.use(authenticateToken);
router.use(requireRole('teacher', 'admin'));

function parseJsonArray(str: string): string[] {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [str];
  } catch {
    return [str];
  }
}

// 1. Teacher Dashboard Overview
router.get('/dashboard', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;

  const students = queryAll(
    `SELECT id, first_name, last_name, username FROM users WHERE role = 'student' AND is_active = 1`
  );

  const feedbackGiven = queryAll(
    `SELECT f.id, f.student_id, f.subject, f.category, f.strengths, f.areas_to_improve, f.personal_comment, f.created_at, f.updated_at,
            s.first_name as student_first_name, s.last_name as student_last_name
     FROM feedback f
     JOIN users s ON f.student_id = s.id
     WHERE f.teacher_id = ?
     ORDER BY f.created_at DESC`,
    [teacherId]
  );

  const formattedFeedback = feedbackGiven.map(f => ({
    ...f,
    strengths: parseJsonArray(f.strengths),
    areas_to_improve: parseJsonArray(f.areas_to_improve)
  }));

  const goalsCreated = queryAll(
    `SELECT g.id, g.student_id, g.feedback_id, g.title, g.description, g.deadline, g.status, g.created_at, g.completed_at,
            s.first_name as student_first_name, s.last_name as student_last_name
     FROM goals g
     JOIN users s ON g.student_id = s.id
     WHERE g.teacher_id = ?
     ORDER BY g.created_at DESC`,
    [teacherId]
  );

  const generalObservations = queryAll(
    `SELECT id, subject, observation, created_at FROM general_observations WHERE teacher_id = ? ORDER BY created_at DESC`,
    [teacherId]
  );

  const recognitionsCount = queryOne(
    `SELECT COUNT(*) as count FROM recognitions WHERE teacher_id = ?`,
    [teacherId]
  )?.count || 0;

  res.json({
    teacher: {
      id: req.user!.id,
      first_name: req.user!.first_name,
      last_name: req.user!.last_name,
      username: req.user!.username,
      subject: req.user!.subject || 'General'
    },
    counts: {
      totalStudents: students.length,
      feedbackGivenCount: feedbackGiven.length,
      activeGoalsCount: goalsCreated.filter(g => g.status !== 'completed').length,
      completedGoalsCount: goalsCreated.filter(g => g.status === 'completed').length,
      generalObservationsCount: generalObservations.length,
      recognitionsCount
    },
    recentFeedback: formattedFeedback.slice(0, 4),
    recentGoals: goalsCreated.slice(0, 4),
    studentsPreview: students.slice(0, 6)
  });
});

// 2. Student List for Teacher
router.get('/students', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { search } = req.query;

  let sql = `
    SELECT id, first_name, last_name, username, created_at
    FROM users
    WHERE role = 'student' AND is_active = 1
  `;
  const params: any[] = [];

  if (search) {
    sql += ` AND (LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ? OR LOWER(username) LIKE ?)`;
    const term = `%${String(search).toLowerCase().trim()}%`;
    params.push(term, term, term);
  }

  sql += ` ORDER BY last_name, first_name`;

  const students = queryAll(sql, params);

  // Compute active goals and feedback count for each student
  const studentRows = students.map(s => {
    const activeGoals = queryOne(
      `SELECT COUNT(*) as count FROM goals WHERE student_id = ? AND status != 'completed'`,
      [s.id]
    )?.count || 0;

    const feedbackCount = queryOne(
      `SELECT COUNT(*) as count FROM feedback WHERE student_id = ? AND teacher_id = ?`,
      [s.id, teacherId]
    )?.count || 0;

    return {
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      username: s.username,
      active_goals_count: activeGoals,
      feedback_count: feedbackCount,
      created_at: s.created_at
    };
  });

  res.json(studentRows);
});

// 3. Student Profile for Teacher
router.get('/students/:id', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { id } = req.params;

  const student = queryOne(
    `SELECT id, first_name, last_name, username, created_at
     FROM users
     WHERE id = ? AND role = 'student'`,
    [id]
  );

  if (!student) {
    res.status(404).json({ error: 'Student not found in this group.' });
    return;
  }

  // Previous feedback given to this student by THIS teacher
  const feedbackList = queryAll(
    `SELECT id, student_id, teacher_id, subject, category, strengths, areas_to_improve, personal_comment, created_at, updated_at
     FROM feedback
     WHERE student_id = ? AND teacher_id = ?
     ORDER BY created_at DESC`,
    [id, teacherId]
  ).map(f => ({
    ...f,
    strengths: parseJsonArray(f.strengths),
    areas_to_improve: parseJsonArray(f.areas_to_improve)
  }));

  // Goals for this student
  const allGoals = queryAll(
    `SELECT id, student_id, teacher_id, feedback_id, title, description, deadline, status, created_at, completed_at
     FROM goals
     WHERE student_id = ? AND teacher_id = ?
     ORDER BY created_at DESC`,
    [id, teacherId]
  );

  const activeGoals = allGoals.filter(g => g.status !== 'completed');
  const completedGoals = allGoals.filter(g => g.status === 'completed');

  // Recognitions
  const recognitions = queryAll(
    `SELECT id, category, reason, created_at
     FROM recognitions
     WHERE student_id = ? AND teacher_id = ?
     ORDER BY created_at DESC`,
    [id, teacherId]
  );

  res.json({
    student,
    feedback: feedbackList,
    active_goals: activeGoals,
    completed_goals: completedGoals,
    recognitions
  });
});

// 4. Give Feedback (Creates private feedback, with optional instant goal creation)
router.post('/feedback', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const {
    student_id,
    subject,
    category,
    strengths,
    areas_to_improve,
    personal_comment,
    create_goal,
    used_suggestion_ids,
    save_to_suggestions
  } = req.body;

  if (!student_id || !subject) {
    res.status(400).json({ error: 'Student and subject are required.' });
    return;
  }

  const student = queryOne(
    `SELECT id, first_name, last_name FROM users WHERE id = ? AND role = 'student'`,
    [student_id]
  );

  if (!student) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  const feedbackId = `fb-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();
  const cat = category?.trim() || 'Understanding';

  const strengthsArray = Array.isArray(strengths)
    ? strengths.filter((s: string) => String(s).trim().length > 0)
    : [String(strengths || '').trim()];

  const areasArray = Array.isArray(areas_to_improve)
    ? areas_to_improve.filter((a: string) => String(a).trim().length > 0)
    : [String(areas_to_improve || '').trim()];

  run(
    `INSERT INTO feedback (id, student_id, teacher_id, subject, category, strengths, areas_to_improve, personal_comment, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
    [
      feedbackId,
      student_id,
      teacherId,
      subject.trim(),
      cat,
      JSON.stringify(strengthsArray),
      JSON.stringify(areasArray),
      personal_comment?.trim() || null,
      now
    ]
  );

  // Fast workflow: Optional instant goal conversion
  let createdGoal = null;
  if (create_goal && create_goal.title && String(create_goal.title).trim()) {
    const goalId = `goal-${Math.random().toString(36).substring(2, 9)}`;
    run(
      `INSERT INTO goals (id, student_id, teacher_id, feedback_id, title, description, deadline, status, created_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'not_started', ?, NULL)`,
      [
        goalId,
        student_id,
        teacherId,
        feedbackId,
        create_goal.title.trim(),
        create_goal.description?.trim() || null,
        create_goal.deadline?.trim() || null,
        now
      ]
    );
    createdGoal = { id: goalId, title: create_goal.title.trim() };

    // Notification for newly created goal
    createNotification(
      student_id,
      'goal_created',
      'New Personal Goal Assigned',
      `Goal: "${create_goal.title.trim()}" (Due: ${create_goal.deadline || 'Ongoing'}).`,
      'goals'
    );
  }

  // Notification for newly created feedback
  createNotification(
    student_id,
    'feedback',
    'New Private Feedback Received',
    `Teacher ${req.user!.first_name} ${req.user!.last_name} shared feedback in ${subject.trim()}: "${cat}".`,
    'feedback'
  );

  // Increment usage count for suggestions used in this feedback
  if (Array.isArray(used_suggestion_ids)) {
    for (const sugId of used_suggestion_ids) {
      run(
        `UPDATE teacher_suggestions SET usage_count = usage_count + 1 WHERE id = ? AND teacher_id = ?`,
        [sugId, teacherId]
      );
    }
  }

  // Save new custom feedback sentences to My Suggestions if requested
  if (Array.isArray(save_to_suggestions)) {
    for (const item of save_to_suggestions) {
      if (item.text && item.text.trim()) {
        const trimmed = item.text.trim();
        const existing = queryOne(
          `SELECT id FROM teacher_suggestions WHERE teacher_id = ? AND text = ?`,
          [teacherId, trimmed]
        );
        if (existing) {
          run(
            `UPDATE teacher_suggestions SET usage_count = usage_count + 1 WHERE id = ?`,
            [existing.id]
          );
        } else {
          const newId = `sug-${Math.random().toString(36).substring(2, 9)}`;
          run(
            `INSERT INTO teacher_suggestions (id, teacher_id, category, text, usage_count, created_at)
             VALUES (?, ?, ?, ?, 1, ?)`,
            [newId, teacherId, item.category || 'Other', trimmed, now]
          );
        }
      }
    }
  }

  res.json({
    success: true,
    feedback_id: feedbackId,
    student_name: `${student.first_name} ${student.last_name}`,
    created_goal: createdGoal
  });
});

// Edit Feedback created by this teacher
router.patch('/feedback/:id', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { id } = req.params;
  const { subject, category, strengths, areas_to_improve, personal_comment } = req.body;

  const existing = queryOne(`SELECT id, teacher_id, student_id, subject FROM feedback WHERE id = ?`, [id]);
  if (!existing) {
    res.status(404).json({ error: 'Feedback not found.' });
    return;
  }

  if (existing.teacher_id !== teacherId) {
    res.status(403).json({ error: 'Access denied: You can only edit feedback you created.' });
    return;
  }

  const strengthsArray = Array.isArray(strengths)
    ? strengths.filter((s: string) => String(s).trim().length > 0)
    : [String(strengths || '').trim()];

  const areasArray = Array.isArray(areas_to_improve)
    ? areas_to_improve.filter((a: string) => String(a).trim().length > 0)
    : [String(areas_to_improve || '').trim()];

  const now = new Date().toISOString();

  run(
    `UPDATE feedback
     SET subject = ?, category = ?, strengths = ?, areas_to_improve = ?, personal_comment = ?, updated_at = ?
     WHERE id = ?`,
    [
      subject?.trim() || 'Mathematics',
      category?.trim() || 'Understanding',
      JSON.stringify(strengthsArray),
      JSON.stringify(areasArray),
      personal_comment?.trim() || null,
      now,
      id
    ]
  );

  // Notification for student
  createNotification(
    existing.student_id,
    'feedback_updated',
    'Feedback Updated',
    `Teacher ${req.user!.first_name} ${req.user!.last_name} updated your feedback in ${subject?.trim() || existing.subject || 'Mathematics'}.`,
    'feedback'
  );

  res.json({ success: true, id, updated_at: now });
});

// Delete Feedback created by this teacher
router.delete('/feedback/:id', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { id } = req.params;

  const existing = queryOne(`SELECT id, teacher_id FROM feedback WHERE id = ?`, [id]);
  if (!existing) {
    res.status(404).json({ error: 'Feedback not found.' });
    return;
  }

  if (existing.teacher_id !== teacherId) {
    res.status(403).json({ error: 'Access denied: You can only delete feedback you created.' });
    return;
  }

  run(`DELETE FROM feedback WHERE id = ?`, [id]);
  res.json({ success: true });
});

// 5. My Suggestions Library
router.get('/suggestions', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { category, search } = req.query;

  let sql = `
    SELECT id, teacher_id, category, text, usage_count, created_at
    FROM teacher_suggestions
    WHERE teacher_id = ?
  `;
  const params: any[] = [teacherId];

  if (category && category !== 'All') {
    sql += ` AND category = ?`;
    params.push(String(category).trim());
  }

  if (search && String(search).trim()) {
    sql += ` AND LOWER(text) LIKE ?`;
    params.push(`%${String(search).toLowerCase().trim()}%`);
  }

  // Frequently used suggestions appear near the top
  sql += ` ORDER BY usage_count DESC, created_at DESC`;

  const suggestions = queryAll(sql, params);
  res.json(suggestions);
});

router.post('/suggestions', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { category, text } = req.body;

  if (!category || !text || !String(text).trim()) {
    res.status(400).json({ error: 'Valid category and text are required.' });
    return;
  }

  const id = `sug-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  run(
    `INSERT INTO teacher_suggestions (id, teacher_id, category, text, usage_count, created_at)
     VALUES (?, ?, ?, ?, 0, ?)`,
    [id, teacherId, String(category).trim(), text.trim(), now]
  );

  res.json({ success: true, id, category: String(category).trim(), text: text.trim(), usage_count: 0 });
});

router.patch('/suggestions/:id', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { id } = req.params;
  const { category, text } = req.body;

  const existing = queryOne(`SELECT id, teacher_id FROM teacher_suggestions WHERE id = ?`, [id]);
  if (!existing) {
    res.status(404).json({ error: 'Suggestion not found.' });
    return;
  }

  if (existing.teacher_id !== teacherId) {
    res.status(403).json({ error: 'Access denied: You can only edit your own suggestions.' });
    return;
  }

  run(
    `UPDATE teacher_suggestions SET category = ?, text = ? WHERE id = ?`,
    [category?.trim() || 'Other', text.trim(), id]
  );

  res.json({ success: true, id });
});

router.post('/suggestions/:id/use', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { id } = req.params;

  const existing = queryOne(`SELECT id, teacher_id, usage_count FROM teacher_suggestions WHERE id = ?`, [id]);
  if (!existing) {
    res.status(404).json({ error: 'Suggestion not found.' });
    return;
  }

  if (existing.teacher_id !== teacherId) {
    res.status(403).json({ error: 'Access denied: You can only use your own suggestions.' });
    return;
  }

  run(
    `UPDATE teacher_suggestions SET usage_count = usage_count + 1 WHERE id = ?`,
    [id]
  );

  res.json({ success: true, id, usage_count: (existing.usage_count || 0) + 1 });
});

router.delete('/suggestions/:id', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { id } = req.params;

  const existing = queryOne(`SELECT id, teacher_id FROM teacher_suggestions WHERE id = ?`, [id]);
  if (!existing) {
    res.status(404).json({ error: 'Suggestion not found.' });
    return;
  }

  if (existing.teacher_id !== teacherId) {
    res.status(403).json({ error: 'Access denied: You can only delete your own suggestions.' });
    return;
  }

  run(
    `DELETE FROM teacher_suggestions WHERE id = ? AND teacher_id = ?`,
    [id, teacherId]
  );

  res.json({ success: true });
});

// 6. General Observations
router.get('/general-observations', (req: AuthenticatedRequest, res: Response): void => {
  const rows = queryAll(
    `SELECT o.id, o.teacher_id, o.category, o.subject, o.observation, o.created_at,
            t.first_name as teacher_first_name, t.last_name as teacher_last_name
     FROM general_observations o
     JOIN users t ON o.teacher_id = t.id
     ORDER BY o.created_at DESC`
  );
  res.json(rows);
});

// Smart Suggestions for General Observations (Detecting repeated feedback themes across cohort)
router.get('/general-observations/theme-suggestions', (req: AuthenticatedRequest, res: Response): void => {
  // Query recent feedback without student-identifying data
  const feedbackRows = queryAll(`SELECT category, areas_to_improve FROM feedback LIMIT 100`);

  const counts: Record<string, number> = {};
  for (const row of feedbackRows) {
    // Count category mentions
    if (row.category) {
      counts[row.category] = (counts[row.category] || 0) + 1;
    }
    // Parse areas to improve
    try {
      const areas: string[] = JSON.parse(row.areas_to_improve);
      if (Array.isArray(areas)) {
        for (const area of areas) {
          const lower = area.toLowerCase();
          if (lower.includes('participat')) counts['Participation'] = (counts['Participation'] || 0) + 1;
          if (lower.includes('revis') || lower.includes('regularly')) counts['Study Habits'] = (counts['Study Habits'] || 0) + 1;
          if (lower.includes('organ') || lower.includes('step')) counts['Organization'] = (counts['Organization'] || 0) + 1;
          if (lower.includes('review') || lower.includes('submitt') || lower.includes('check')) counts['Review Work'] = (counts['Review Work'] || 0) + 1;
          if (lower.includes('time') || lower.includes('focus')) counts['Focus & Time'] = (counts['Focus & Time'] || 0) + 1;
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  // Pre-configured practical smart observations based on detected cohort themes
  const smartSuggestions: Array<{
    theme: string;
    category: string;
    suggestedObservation: string;
    suggestedGoalTitle: string;
    suggestedGoalDescription: string;
    frequencyCount: number;
  }> = [];

  if ((counts['Participation'] || 0) >= 1) {
    smartSuggestions.push({
      theme: 'Participation',
      category: 'Participation',
      suggestedObservation: 'Participation during discussions could be improved; do not hesitate to ask questions.',
      suggestedGoalTitle: 'Participate during discussions',
      suggestedGoalDescription: 'Build confidence in sharing your problem-solving thoughts aloud with the group.',
      frequencyCount: counts['Participation'] || 1
    });
  }

  if ((counts['Study Habits'] || 0) >= 1) {
    smartSuggestions.push({
      theme: 'Regular Revision',
      category: 'Study Habits',
      suggestedObservation: 'Students should revise previous lessons more regularly to retain foundational formulas.',
      suggestedGoalTitle: 'Review the previous lesson before the next class',
      suggestedGoalDescription: 'Spend 10 minutes reviewing key definitions and formulas prior to class.',
      frequencyCount: counts['Study Habits'] || 1
    });
  }

  if ((counts['Organization'] || 0) >= 1) {
    smartSuggestions.push({
      theme: 'Written Organization',
      category: 'Organization',
      suggestedObservation: 'Written work should be organized more clearly with step-by-step lines.',
      suggestedGoalTitle: 'Check written work before submitting it',
      suggestedGoalDescription: 'Double check all units, signs, and step clarity before handing in assignments.',
      frequencyCount: counts['Organization'] || 1
    });
  }

  if ((counts['Homework'] || 0) >= 1 || (counts['Review Work'] || 0) >= 1) {
    smartSuggestions.push({
      theme: 'Homework & Accuracy',
      category: 'Homework',
      suggestedObservation: 'Check written work before submitting it to verify calculation steps and units.',
      suggestedGoalTitle: 'Complete homework regularly',
      suggestedGoalDescription: 'Submit all weekly assignment sheets on time before Friday afternoon.',
      frequencyCount: (counts['Homework'] || 0) + (counts['Review Work'] || 0)
    });
  }

  // Sort by frequency
  smartSuggestions.sort((a, b) => b.frequencyCount - a.frequencyCount);
  res.json(smartSuggestions);
});

router.post('/general-observations', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { category, subject, observation } = req.body;

  if (!observation || !String(observation).trim()) {
    res.status(400).json({ error: 'Observation text is required.' });
    return;
  }

  const id = `obs-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  run(
    `INSERT INTO general_observations (id, teacher_id, category, subject, observation, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      teacherId,
      category?.trim() || 'General',
      subject?.trim() || req.user!.subject || 'General',
      observation.trim(),
      now
    ]
  );

  res.json({ success: true, id });
});

router.patch('/general-observations/:id', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { id } = req.params;
  const { category, subject, observation } = req.body;

  const existing = queryOne(`SELECT id, teacher_id FROM general_observations WHERE id = ?`, [id]);
  if (!existing) {
    res.status(404).json({ error: 'General observation not found.' });
    return;
  }

  if (existing.teacher_id !== teacherId) {
    res.status(403).json({ error: 'Access denied: You can only edit observations you created.' });
    return;
  }

  run(
    `UPDATE general_observations SET category = ?, subject = ?, observation = ? WHERE id = ?`,
    [category?.trim() || 'General', subject?.trim() || 'General', observation.trim(), id]
  );

  res.json({ success: true, id });
});

router.delete('/general-observations/:id', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { id } = req.params;

  const existing = queryOne(`SELECT id, teacher_id FROM general_observations WHERE id = ?`, [id]);
  if (!existing) {
    res.status(404).json({ error: 'General observation not found.' });
    return;
  }

  if (existing.teacher_id !== teacherId) {
    res.status(403).json({ error: 'Access denied: You can only delete observations you created.' });
    return;
  }

  run(`DELETE FROM general_observations WHERE id = ?`, [id]);
  res.json({ success: true });
});

// 7. General Goals Management
router.get('/general-goals', (req: AuthenticatedRequest, res: Response): void => {
  const rows = queryAll(
    `SELECT gg.id, gg.teacher_id, gg.title, gg.description, gg.deadline, gg.status, gg.created_at,
            t.first_name as teacher_first_name, t.last_name as teacher_last_name
     FROM general_goals gg
     JOIN users t ON gg.teacher_id = t.id
     ORDER BY gg.created_at DESC`
  );
  res.json(rows);
});

router.post('/general-goals', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { title, description, deadline, status } = req.body;

  if (!title || !String(title).trim()) {
    res.status(400).json({ error: 'Goal title is required.' });
    return;
  }

  const id = `gg-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  run(
    `INSERT INTO general_goals (id, teacher_id, title, description, deadline, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      teacherId,
      title.trim(),
      description?.trim() || null,
      deadline?.trim() || null,
      status || 'active',
      now
    ]
  );

  res.json({ success: true, id });
});

router.patch('/general-goals/:id', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { id } = req.params;
  const { title, description, deadline, status } = req.body;

  const existing = queryOne(`SELECT id, teacher_id FROM general_goals WHERE id = ?`, [id]);
  if (!existing) {
    res.status(404).json({ error: 'General goal not found.' });
    return;
  }

  if (existing.teacher_id !== teacherId) {
    res.status(403).json({ error: 'Access denied: You can only edit goals you created.' });
    return;
  }

  run(
    `UPDATE general_goals SET title = ?, description = ?, deadline = ?, status = ? WHERE id = ?`,
    [title.trim(), description?.trim() || null, deadline?.trim() || null, status || 'active', id]
  );

  res.json({ success: true, id });
});

router.delete('/general-goals/:id', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { id } = req.params;

  const existing = queryOne(`SELECT id, teacher_id FROM general_goals WHERE id = ?`, [id]);
  if (!existing) {
    res.status(404).json({ error: 'General goal not found.' });
    return;
  }

  if (existing.teacher_id !== teacherId) {
    res.status(403).json({ error: 'Access denied: You can only delete goals you created.' });
    return;
  }

  run(`DELETE FROM general_goals WHERE id = ?`, [id]);
  res.json({ success: true });
});

// 7. Goals Management for Teacher
router.get('/goals', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const goals = queryAll(
    `SELECT g.id, g.student_id, g.feedback_id, g.title, g.description, g.deadline, g.status, g.created_at, g.completed_at,
            s.first_name as student_first_name, s.last_name as student_last_name
     FROM goals g
     JOIN users s ON g.student_id = s.id
     WHERE g.teacher_id = ?
     ORDER BY 
       CASE g.status WHEN 'in_progress' THEN 1 WHEN 'not_started' THEN 2 ELSE 3 END,
       g.created_at DESC`,
    [teacherId]
  );
  res.json(goals);
});

router.post('/goals', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { student_id, title, description, deadline, feedback_id } = req.body;

  if (!student_id || !title || !String(title).trim()) {
    res.status(400).json({ error: 'Student and title are required.' });
    return;
  }

  const student = queryOne(`SELECT id FROM users WHERE id = ? AND role = 'student'`, [student_id]);
  if (!student) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  const id = `goal-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  run(
    `INSERT INTO goals (id, student_id, teacher_id, feedback_id, title, description, deadline, status, created_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'not_started', ?, NULL)`,
    [
      id,
      student_id,
      teacherId,
      feedback_id || null,
      title.trim(),
      description?.trim() || null,
      deadline?.trim() || null,
      now
    ]
  );

  // Notify student of new goal
  createNotification(
    student_id,
    'goal_created',
    'New Personal Goal Assigned',
    `Teacher ${req.user!.first_name} ${req.user!.last_name} assigned you: "${title.trim()}".`,
    'goals'
  );

  res.json({ success: true, id });
});

// Edit Goal created by this teacher
router.patch('/goals/:id', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { id } = req.params;
  const { title, description, deadline, status } = req.body;

  const existing = queryOne(`SELECT id, teacher_id, student_id FROM goals WHERE id = ?`, [id]);
  if (!existing) {
    res.status(404).json({ error: 'Goal not found.' });
    return;
  }

  if (existing.teacher_id !== teacherId) {
    res.status(403).json({ error: 'Access denied: You can only edit goals you created.' });
    return;
  }

  const completedAt = status === 'completed' ? new Date().toISOString() : null;

  run(
    `UPDATE goals
     SET title = ?, description = ?, deadline = ?, status = ?, completed_at = ?
     WHERE id = ?`,
    [
      title.trim(),
      description?.trim() || null,
      deadline?.trim() || null,
      status || 'not_started',
      completedAt,
      id
    ]
  );

  // Notify student of updated goal
  createNotification(
    existing.student_id,
    'goal_updated',
    'Goal Updated',
    `Teacher ${req.user!.first_name} ${req.user!.last_name} updated your goal: "${title.trim()}".`,
    'goals'
  );

  res.json({ success: true, id });
});

// Delete Goal created by this teacher
router.delete('/goals/:id', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { id } = req.params;

  const existing = queryOne(`SELECT id, teacher_id FROM goals WHERE id = ?`, [id]);
  if (!existing) {
    res.status(404).json({ error: 'Goal not found.' });
    return;
  }

  if (existing.teacher_id !== teacherId) {
    res.status(403).json({ error: 'Access denied: You can only delete goals you created.' });
    return;
  }

  run(`DELETE FROM goals WHERE id = ?`, [id]);
  res.json({ success: true });
});

// 8. Positive Recognition ("Students who stood out")
router.get(['/recognitions', '/recognition'], (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const list = queryAll(
    `SELECT r.id, r.teacher_id, r.student_id, r.category, r.reason, r.created_at,
            s.first_name as student_first_name, s.last_name as student_last_name
     FROM recognitions r
     JOIN users s ON r.student_id = s.id
     WHERE r.teacher_id = ?
     ORDER BY r.created_at DESC`,
    [teacherId]
  );
  res.json(list);
});

router.post(['/recognitions', '/recognition'], (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { student_id, student_ids, category, badge_type, reason } = req.body;

  const selectedCategory = category?.trim() || badge_type?.trim();
  if (!selectedCategory || !reason || !String(reason).trim()) {
    res.status(400).json({ error: 'Category/Reason type and explanation are required.' });
    return;
  }

  const targetStudentIds: string[] = Array.isArray(student_ids) && student_ids.length > 0
    ? student_ids
    : student_id ? [student_id] : [];

  if (targetStudentIds.length === 0) {
    res.status(400).json({ error: 'Please select at least one student.' });
    return;
  }

  const now = new Date().toISOString();
  const createdIds: string[] = [];

  for (const sId of targetStudentIds) {
    const recId = `rec-${Math.random().toString(36).substring(2, 9)}`;
    run(
      `INSERT INTO recognitions (id, teacher_id, student_id, category, reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [recId, teacherId, sId, selectedCategory, reason.trim(), now]
    );
    createdIds.push(recId);

    // Notify student
    createNotification(
      sId,
      'recognition',
      'Positive Recognition! 🌟',
      `Teacher ${req.user!.first_name} ${req.user!.last_name} recognized you for ${selectedCategory}: "${reason.trim()}".`,
      'recognition'
    );
  }

  res.json({ success: true, count: createdIds.length, ids: createdIds });
});

router.delete('/recognitions/:id', (req: AuthenticatedRequest, res: Response): void => {
  const teacherId = req.user!.id;
  const { id } = req.params;

  const existing = queryOne(`SELECT id, teacher_id FROM recognitions WHERE id = ?`, [id]);
  if (!existing) {
    res.status(404).json({ error: 'Recognition not found.' });
    return;
  }

  if (existing.teacher_id !== teacherId) {
    res.status(403).json({ error: 'Access denied: You can only delete recognition you created.' });
    return;
  }

  run(`DELETE FROM recognitions WHERE id = ?`, [id]);
  res.json({ success: true });
});

// Foundation route for backwards compatibility
router.get('/dashboard-foundation', (req: AuthenticatedRequest, res: Response): void => {
  res.json({
    role: req.user!.role,
    first_name: req.user!.first_name,
    last_name: req.user!.last_name,
    username: req.user!.username,
    subject: req.user!.subject || 'Mathematics',
    message: 'Teacher Portal Foundation - Access verified.'
  });
});

export default router;
