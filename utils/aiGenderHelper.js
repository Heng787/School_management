// --- Config & Initialization ---
// AI is now handled securely on the backend.
// Phonetic fallback remains on the frontend.

/** Normalises a raw AI value to "Male" | "Female" | null. */
const GENDER_LOOKUP = {
  male: 'Male',
  m: 'Male',
  boy: 'Male',
  man: 'Male',
  female: 'Female',
  f: 'Female',
  girl: 'Female',
  woman: 'Female',
};

const resolveGender = (raw) => {
  const s = String(raw || '').trim().toLowerCase();
  if (s.startsWith('male') || s === 'm' || s === 'boy' || s === 'man') {
    return 'Male';
  }
  if (s.startsWith('female') || s === 'f' || s === 'girl' || s === 'woman') {
    return 'Female';
  }
  return null;
};

// --- Khmer Phonetic Rules ---
// Evaluated top-to-bottom; ordering handles shared entries like "chan"
// (male prefix rule appears before female, so male wins on the family name).

const RULES = [
  {
    type: 'word',
    gender: 'Female',
    values: new Set([
      'srey',
      'neary',
      'neak',
      'bopha',
      'sodavy',
      'pisey',
      'kunthea',
      'chenda',
      'chanbopha',
      'oudom',
      'ratana',
    ]),
  },
  {
    type: 'word',
    gender: 'Male',
    values: new Set(['bun']),
  },
  {
    type: 'prefix',
    gender: 'Male',
    // "chan" listed here before the female prefix rule below
    values: ['bun', 'puth', 'sous', 'chan'],
  },
  {
    type: 'prefix',
    gender: 'Female',
    values: ['srey', 'neary', 'chan'],
  },
  {
    type: 'suffix',
    gender: 'Female',
    values: [
      'channary',
      'sophapich',
      'sreynich',
      'sreyleak',
      'sreymom',
      'chanthou',
      'phary',
      'nary',
      'vary',
      'neary',
      'bopha',
      'nika',
      'vina',
      'mony',
      'chanthy',
      'pisey',
      'rachna',
      'vicheka',
      'kalyna',
      'chandy',
      'nita',
      'lina',
      'rina',
      'sina',
      'tina',
      'phea',
      'sreya',
      'devi',
      'linh',
      'thida',
      'vanda',
      'sambo',
      'ratha',
      'panha',
      'pich',
      'nich',
      'leak',
      'meyly',
      'sorphea',
      'mary',
      'kiry',
      'navy',
      'roth',
      'ley',
      'ney',
      'ovy',
      'ivy',
      'vy',
      'ny',
      'ly',
      'na',
      'da',
      'ra',
      'ka',
      'ya',
    ],
  },
  {
    type: 'suffix',
    gender: 'Male',
    values: [
      'narith',
      'sophearith',
      'vicharith',
      'vuth',
      'reach',
      'leang',
      'thun',
      'kheang',
      'chheng',
      'rith',
      'rath',
      'nath',
      'keth',
      'seth',
      'vith',
      'deth',
      'phet',
      'vuthy',
      'dara',
      'hak',
      'rak',
      'nav',
      'kov',
      'sour',
      'vinh',
      'long',
      'pong',
      'sang',
      'hong',
      'chhay',
      'vann',
      'chan',
      'to',
      'oun',
      'ang',
      'eng',
      'ong',
      'uth',
      'sal',
      'dy',
    ],
  },
];

/**
 * Classifies a Cambodian name using phonetic rules.
 * Returns null when no rule matches — the caller decides the final fallback.
 */
export const inferGenderByPhonetics = (name) => {
  if (!name || !name.trim()) return null;

  const lower = name.trim().toLowerCase();
  const words = lower.split(/\s+/);
  const given = words[words.length - 1]; // given name is last in Cambodian convention

  for (const rule of RULES) {
    if (rule.type === 'word' && words.some((w) => rule.values.has(w))) {
      return rule.gender;
    }
    if (rule.type === 'prefix' && rule.values.includes(words[0])) {
      return rule.gender;
    }
    if (rule.type === 'suffix' && rule.values.some((s) => given.endsWith(s))) {
      return rule.gender;
    }
  }

  return null;
};

// --- AI Batch Processing ---

/**
 * Sends one batch to the backend AI service.
 */
const inferGenderBatch = async (batch) => {
  const token = localStorage.getItem('school_admin_token');
  if (!token) throw new Error('AI_ERROR_AUTH');

  try {
    const res = await fetch('/api/ai/infer-gender', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ names: batch })
    });

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) throw new Error('AI_ERROR_AUTH');
      if (res.status === 429) throw new Error('AI_ERROR_QUOTA');
      throw new Error('AI_ERROR_FAILED');
    }

    const normalized = {};
    for (const [name, value] of Object.entries(data.data || {})) {
      const gender = resolveGender(value);
      if (gender) {
        normalized[name.trim().toLowerCase()] = gender;
      }
    }
    return normalized;
  } catch (e) {
    console.error('AI batch failed:', e.message);
    throw e;
  }
};

// --- Public API ---

/**
 * Infers gender for a list of names.
 * AI runs first (concurrent batches). Phonetics fills any gaps.
 */
export const inferGenders = async (names) => {
  if (!names || names.length === 0) return {};

  // Batch to avoid Gemini output truncation on large lists
  const BATCH_SIZE = 50;
  const batches = [];
  for (let i = 0; i < names.length; i += BATCH_SIZE) {
    batches.push(names.slice(i, i + BATCH_SIZE));
  }

  let aiResult = {};
  
  if (navigator.onLine) {
    try {
      // All batches run concurrently
      const results = await Promise.all(
        batches.map((b) => inferGenderBatch(b))
      );
      results.forEach((r) => Object.assign(aiResult, r));
      console.info(
        `AI resolved ${Object.keys(aiResult).length}/${names.length} names.`
      );
    } catch (err) {
      // Any AI failure falls back to phonetics for all names
      console.warn(
        `AI inference failed (${err.message}), using phonetics for all names.`
      );
      aiResult = {};
    }
  }

  // Phonetics fills any name AI didn't resolve
  const result = {};
  for (const name of names) {
    const key = name.trim().toLowerCase();
    result[key] = aiResult[key] ?? inferGenderByPhonetics(name);
  }

  const resolvedCount = Object.values(result).filter(Boolean).length;
  console.info(`Gender inference: ${resolvedCount}/${names.length} resolved.`);
  return result;
};
