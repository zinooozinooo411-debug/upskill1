import initSqlJs from 'sql.js';
import type { Database as SqlDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_FILE_PATH = path.resolve(process.cwd(), 'student_growth.sqlite');

let dbInstance: SqlDatabase | null = null;

export async function getDb(): Promise<SqlDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE_PATH);
      dbInstance = new SQL.Database(fileBuffer);
      initSchema(dbInstance);
      return dbInstance;
    } catch (e) {
      console.error('Error reading existing DB file, creating fresh database:', e);
    }
  }

  dbInstance = new SQL.Database();
  initSchema(dbInstance);
  saveDb();
  return dbInstance;
}

export function saveDb(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE_PATH, buffer);
  } catch (err) {
    console.error('Failed to save database to disk:', err);
  }
}

export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  if (!dbInstance) throw new Error('Database not initialized');
  const stmt = dbInstance.prepare(sql);
  try {
    stmt.bind(params);
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as T);
    }
    return results;
  } finally {
    stmt.free();
  }
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const rows = queryAll<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function run(sql: string, params: any[] = []): { changes: number } {
  if (!dbInstance) throw new Error('Database not initialized');
  dbInstance.run(sql, params);
  saveDb();
  return { changes: 1 };
}

export function getSetting(key: string, defaultValue: string = ''): string {
  const row = queryOne<{ value: string }>('SELECT value FROM system_settings WHERE key = ?', [key]);
  return row ? row.value : defaultValue;
}

export function setSetting(key: string, value: string): void {
  const existing = queryOne('SELECT key FROM system_settings WHERE key = ?', [key]);
  if (existing) {
    run('UPDATE system_settings SET value = ? WHERE key = ?', [value, key]);
  } else {
    run('INSERT INTO system_settings (key, value) VALUES (?, ?)', [key, value]);
  }
}

function initSchema(db: SqlDatabase): void {
  db.run(`PRAGMA foreign_keys = ON;`);

  db.run(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO system_settings (key, value) VALUES ('allow_registration', '0');

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'teacher', 'student')) NOT NULL,
      subject TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      teacher_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT DEFAULT 'Understanding' NOT NULL,
      strengths TEXT NOT NULL,
      areas_to_improve TEXT NOT NULL,
      personal_comment TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      teacher_id TEXT NOT NULL,
      feedback_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      deadline TEXT,
      status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
      created_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS general_observations (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      category TEXT DEFAULT 'General' NOT NULL,
      subject TEXT,
      observation TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS general_goals (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      deadline TEXT,
      status TEXT DEFAULT 'active' NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS teacher_suggestions (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      category TEXT NOT NULL,
      text TEXT NOT NULL,
      usage_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recognitions (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      category TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      link TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

export function resetToCleanProduction(): void {
  if (!dbInstance) return;
  dbInstance.run(`
    DELETE FROM notifications;
    DELETE FROM recognitions;
    DELETE FROM teacher_suggestions;
    DELETE FROM general_goals;
    DELETE FROM general_observations;
    DELETE FROM goals;
    DELETE FROM feedback;
    DELETE FROM users;
  `);
  saveDb();
}
