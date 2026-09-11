import { pool } from '../db/pool.js';

let tableEnsured = false;

const DEFAULT_SEEDS = [
  {
    category: 'World Policy & Geopolitics',
    category_slug: 'world-news',
    question: 'Which global treaty or framework was recently highlighted by international trade ministries for standardizing cross-border digital economy regulations?',
    options: [
      'Digital Economy Partnership Agreement (DEPA)',
      'Kyoto Protocol Annex B',
      'Bretton Woods Monetary Accord',
      'Maritime Border Safety Treaty',
    ],
    correct_index: 0,
    explanation: 'The Digital Economy Partnership Agreement (DEPA) is pioneering international digital trade rules, data flow safeguards, and AI governance standards.',
    audience_votes: [74, 11, 9, 6],
    key_term: 'DEPA Digital Trade Accord',
    order_num: 1,
  },
  {
    category: 'Global Markets & Banking',
    category_slug: 'banking-economics',
    question: 'What is the primary indicator monitored by central banks when assessing underlying consumer inflation excluding volatile food and energy costs?',
    options: [
      'Gross Capital Expenditure Ratio',
      'Core Consumer Price Index (Core CPI)',
      'Producer Inventory Velocity',
      'Composite PMI Manufacturing Index',
    ],
    correct_index: 1,
    explanation: 'Core CPI strips out food and energy volatility to give monetary policy committees a cleaner measure of persistent inflationary pressures.',
    audience_votes: [8, 81, 6, 5],
    key_term: 'Core CPI Benchmark',
    order_num: 2,
  },
  {
    category: 'Technology & AI',
    category_slug: 'technology',
    question: 'In modern generative AI and chip architecture, what specialized hardware accelerator design is predominantly used to compute matrix tensor operations at high speed?',
    options: [
      'FPGA Floating Units',
      'Tensor Processing Units / GPU Tensor Cores',
      'Electromechanical Relays',
      'Serial Magnetic Bubble Memory',
    ],
    correct_index: 1,
    explanation: 'Tensor Cores and TPUs optimize low-precision matrix multiply-accumulate operations, the fundamental math engine powering modern LLMs.',
    audience_votes: [14, 76, 4, 6],
    key_term: 'TPU & Matrix Accelerators',
    order_num: 3,
  },
  {
    category: 'Space & Defense',
    category_slug: 'world-news',
    question: 'Which sovereign multi-satellite constellation is Europe currently developing to ensure sovereign secure satellite connectivity (similar to Starlink)?',
    options: [
      'Galileo Sentinel-9',
      'IRIS² (Infrastructure for Resilience, Interconnectivity and Security)',
      'Artemis Deep Orbit Grid',
      'Copernicus Solar Array',
    ],
    correct_index: 1,
    explanation: 'IRIS² is the European Union flagship multi-orbital secure satellite connectivity initiative built in collaboration with European aerospace leaders.',
    audience_votes: [12, 69, 13, 6],
    key_term: 'IRIS² European Constellation',
    order_num: 4,
  },
  {
    category: 'Sports & Athletics',
    category_slug: 'sports',
    question: 'In international cricket, what is the standard maximum number of overs allotted to a single bowler in a standard 50-over One Day International (ODI) match?',
    options: [
      '8 Overs',
      '10 Overs',
      '12 Overs',
      '15 Overs',
    ],
    correct_index: 1,
    explanation: 'Under ICC regulations for 50-over ODIs, no bowler may bowl more than 10 overs in an uninterrupted innings.',
    audience_votes: [3, 89, 5, 3],
    key_term: 'ICC 10-Over Limit Rule',
    order_num: 5,
  },
];

export async function ensureQuizTablesExist() {
  if (tableEnsured) return;

  const createTableSql = `
    CREATE TABLE IF NOT EXISTS news_quiz_questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      edition_date VARCHAR(32) NOT NULL DEFAULT '',
      category VARCHAR(128) NOT NULL DEFAULT 'World Policy & Geopolitics',
      category_slug VARCHAR(64) NOT NULL DEFAULT 'world-news',
      question TEXT NOT NULL,
      options JSON NOT NULL,
      correct_index INT NOT NULL DEFAULT 0,
      explanation TEXT NOT NULL,
      audience_votes JSON NOT NULL,
      key_term VARCHAR(128) NOT NULL DEFAULT '',
      order_num INT NOT NULL DEFAULT 1,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_edition_active (edition_date, is_active, order_num)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await pool.query(createTableSql);

    // Check if table is empty
    const [existing] = await pool.query('SELECT COUNT(*) AS count FROM news_quiz_questions');
    if ((existing[0]?.count ?? 0) === 0) {
      const today = new Date().toISOString().slice(0, 10);
      for (const item of DEFAULT_SEEDS) {
        await pool.query(
          `INSERT INTO news_quiz_questions 
           (edition_date, category, category_slug, question, options, correct_index, explanation, audience_votes, key_term, order_num, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            today,
            item.category,
            item.category_slug,
            item.question,
            JSON.stringify(item.options),
            item.correct_index,
            item.explanation,
            JSON.stringify(item.audience_votes),
            item.key_term,
            item.order_num,
          ]
        );
      }
    }

    tableEnsured = true;
  } catch (err) {
    console.warn('[quiz.model] Table initialization warning:', err.message);
  }
}

function parseQuizRow(row) {
  if (!row) return null;
  let options = row.options;
  if (typeof options === 'string') {
    try {
      options = JSON.parse(options);
    } catch {
      options = [];
    }
  }
  let audienceVotes = row.audience_votes;
  if (typeof audienceVotes === 'string') {
    try {
      audienceVotes = JSON.parse(audienceVotes);
    } catch {
      audienceVotes = [70, 10, 10, 10];
    }
  }

  return {
    id: row.id,
    editionDate: row.edition_date,
    category: row.category,
    categorySlug: row.category_slug,
    question: row.question,
    options: Array.isArray(options) ? options : [],
    correctIndex: Number(row.correct_index ?? 0),
    explanation: row.explanation,
    audienceVotes: Array.isArray(audienceVotes) ? audienceVotes : [70, 10, 10, 10],
    keyTerm: row.key_term,
    orderNum: Number(row.order_num ?? 1),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get active daily quiz questions for a date (or latest active questions).
 */
export async function getActiveDailyQuiz(dateStr) {
  await ensureQuizTablesExist();

  const targetDate = dateStr || new Date().toISOString().slice(0, 10);

  // 1. Try fetching questions matching targetDate
  const [exactRows] = await pool.query(
    `SELECT * FROM news_quiz_questions
     WHERE is_active = 1 AND edition_date = ?
     ORDER BY order_num ASC, id ASC
     LIMIT 10`,
    [targetDate]
  );

  if (exactRows.length > 0) {
    return exactRows.map(parseQuizRow);
  }

  // 2. Fallback: Fetch latest active questions
  const [fallbackRows] = await pool.query(
    `SELECT * FROM news_quiz_questions
     WHERE is_active = 1
     ORDER BY edition_date DESC, order_num ASC, id ASC
     LIMIT 5`
  );

  if (fallbackRows.length > 0) {
    return fallbackRows.map(parseQuizRow);
  }

  return DEFAULT_SEEDS.map((s, idx) => ({
    id: idx + 1,
    editionDate: targetDate,
    category: s.category,
    categorySlug: s.category_slug,
    question: s.question,
    options: s.options,
    correctIndex: s.correct_index,
    explanation: s.explanation,
    audienceVotes: s.audience_votes,
    keyTerm: s.key_term,
    orderNum: s.order_num,
    isActive: true,
  }));
}

/**
 * List all quiz questions for Admin management.
 */
export async function listAdminQuizQuestions({ status, date, search, page = 1, limit = 50 } = {}) {
  await ensureQuizTablesExist();

  const conditions = [];
  const params = [];

  if (status === 'active') {
    conditions.push('is_active = 1');
  } else if (status === 'inactive') {
    conditions.push('is_active = 0');
  }

  if (date) {
    conditions.push('edition_date = ?');
    params.push(date);
  }

  if (search) {
    conditions.push('(question LIKE ? OR category LIKE ? OR key_term LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (Math.max(1, Number(page)) - 1) * Number(limit);

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM news_quiz_questions ${whereSql}`,
    params
  );
  const total = countRows[0]?.total ?? 0;

  const [rows] = await pool.query(
    `SELECT * FROM news_quiz_questions 
     ${whereSql}
     ORDER BY edition_date DESC, order_num ASC, id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );

  return {
    questions: rows.map(parseQuizRow),
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  };
}

/**
 * Get question by ID.
 */
export async function getQuizQuestionById(id) {
  await ensureQuizTablesExist();
  const [rows] = await pool.query('SELECT * FROM news_quiz_questions WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  return parseQuizRow(rows[0]);
}

/**
 * Create a new quiz question.
 */
export async function createQuizQuestion(data) {
  await ensureQuizTablesExist();

  const editionDate = data.editionDate || new Date().toISOString().slice(0, 10);
  const category = data.category || 'World Policy & Geopolitics';
  const categorySlug = data.categorySlug || 'world-news';
  const question = data.question?.trim();
  const options = Array.isArray(data.options) ? data.options : [];
  const correctIndex = Number(data.correctIndex ?? 0);
  const explanation = data.explanation?.trim() || '';
  const audienceVotes = Array.isArray(data.audienceVotes) && data.audienceVotes.length === 4
    ? data.audienceVotes
    : [70, 10, 10, 10];
  const keyTerm = data.keyTerm?.trim() || '';
  const orderNum = Number(data.orderNum ?? 1);
  const isActive = data.isActive !== false ? 1 : 0;

  if (!question) {
    throw new Error('Question text is required');
  }
  if (options.length < 2) {
    throw new Error('At least 2 options are required');
  }

  const [result] = await pool.query(
    `INSERT INTO news_quiz_questions 
     (edition_date, category, category_slug, question, options, correct_index, explanation, audience_votes, key_term, order_num, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      editionDate,
      category,
      categorySlug,
      question,
      JSON.stringify(options),
      correctIndex,
      explanation,
      JSON.stringify(audienceVotes),
      keyTerm,
      orderNum,
      isActive,
    ]
  );

  return getQuizQuestionById(result.insertId);
}

/**
 * Update an existing quiz question.
 */
export async function updateQuizQuestion(id, data) {
  await ensureQuizTablesExist();

  const current = await getQuizQuestionById(id);
  if (!current) {
    throw new Error(`Quiz question #${id} not found`);
  }

  const editionDate = data.editionDate !== undefined ? data.editionDate : current.editionDate;
  const category = data.category !== undefined ? data.category : current.category;
  const categorySlug = data.categorySlug !== undefined ? data.categorySlug : current.categorySlug;
  const question = data.question !== undefined ? data.question.trim() : current.question;
  const options = data.options !== undefined ? (Array.isArray(data.options) ? data.options : []) : current.options;
  const correctIndex = data.correctIndex !== undefined ? Number(data.correctIndex) : current.correctIndex;
  const explanation = data.explanation !== undefined ? data.explanation.trim() : current.explanation;
  const audienceVotes = data.audienceVotes !== undefined
    ? (Array.isArray(data.audienceVotes) ? data.audienceVotes : [70, 10, 10, 10])
    : current.audienceVotes;
  const keyTerm = data.keyTerm !== undefined ? data.keyTerm.trim() : current.keyTerm;
  const orderNum = data.orderNum !== undefined ? Number(data.orderNum) : current.orderNum;
  const isActive = data.isActive !== undefined ? (data.isActive ? 1 : 0) : (current.isActive ? 1 : 0);

  await pool.query(
    `UPDATE news_quiz_questions SET
      edition_date = ?,
      category = ?,
      category_slug = ?,
      question = ?,
      options = ?,
      correct_index = ?,
      explanation = ?,
      audience_votes = ?,
      key_term = ?,
      order_num = ?,
      is_active = ?
     WHERE id = ?`,
    [
      editionDate,
      category,
      categorySlug,
      question,
      JSON.stringify(options),
      correctIndex,
      explanation,
      JSON.stringify(audienceVotes),
      keyTerm,
      orderNum,
      isActive,
      id,
    ]
  );

  return getQuizQuestionById(id);
}

/**
 * Delete a quiz question.
 */
export async function deleteQuizQuestion(id) {
  await ensureQuizTablesExist();
  const [res] = await pool.query('DELETE FROM news_quiz_questions WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

/**
 * Toggle active status of a quiz question.
 */
export async function toggleQuizQuestionActive(id) {
  await ensureQuizTablesExist();
  const current = await getQuizQuestionById(id);
  if (!current) {
    throw new Error(`Quiz question #${id} not found`);
  }
  const nextActive = current.isActive ? 0 : 1;
  await pool.query('UPDATE news_quiz_questions SET is_active = ? WHERE id = ?', [nextActive, id]);
  return getQuizQuestionById(id);
}

/**
 * Seed default set for today or a specific date.
 */
export async function seedDefaultQuizQuestions(forDate) {
  await ensureQuizTablesExist();
  const dateStr = forDate || new Date().toISOString().slice(0, 10);

  for (const item of DEFAULT_SEEDS) {
    await pool.query(
      `INSERT INTO news_quiz_questions 
       (edition_date, category, category_slug, question, options, correct_index, explanation, audience_votes, key_term, order_num, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        dateStr,
        item.category,
        item.category_slug,
        item.question,
        JSON.stringify(item.options),
        item.correct_index,
        item.explanation,
        JSON.stringify(item.audience_votes),
        item.key_term,
        item.order_num,
      ]
    );
  }

  return getActiveDailyQuiz(dateStr);
}
