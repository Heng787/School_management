/**
 * Shared utility functions for data management and transformation.
 */

// --- Constants ---

/**
 * Generates a list of public holidays for Cambodia for a range of years.
 */
export const generateHolidays = (startYear = 2024, endYear = 2030) => {
  const baseHolidays = [
    {
      title: 'International New Year’s Day',
      datePattern: '-01-01',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Victory over Genocide Day',
      datePattern: '-01-07',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'International Women’s Day',
      datePattern: '-03-08',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Khmer New Year (Chol Chnam Thmey)',
      datePattern: '-04-14',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Khmer New Year (Chol Chnam Thmey)',
      datePattern: '-04-15',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Khmer New Year (Chol Chnam Thmey)',
      datePattern: '-04-16',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'International Labor Day',
      datePattern: '-05-01',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Royal Ploughing Ceremony',
      datePattern: '-05-05',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'King Norodom Sihamoni’s Birthday',
      datePattern: '-05-14',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Visak Bochea Day',
      datePattern: '-05-22',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Queen Mother Norodom Monineath Sihanouk’s Birthday',
      datePattern: '-06-18',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Constitution Day',
      datePattern: '-09-24',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Pchum Ben Festival',
      datePattern: '-10-10',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Pchum Ben Festival',
      datePattern: '-10-11',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Pchum Ben Festival',
      datePattern: '-10-12',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Commemoration Day of the late King Father',
      datePattern: '-10-15',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'King Norodom Sihamoni’s Coronation Day',
      datePattern: '-10-29',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Independence Day',
      datePattern: '-11-09',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Water Festival',
      datePattern: '-11-23',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Water Festival',
      datePattern: '-11-24',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Water Festival',
      datePattern: '-11-25',
      type: 'Holiday',
      description: 'Public Holiday',
    },
    {
      title: 'Peace Day',
      datePattern: '-12-29',
      type: 'Holiday',
      description: 'Public Holiday',
    },
  ];

  const holidays = [];
  for (let y = startYear; y <= endYear; y++) {
    baseHolidays.forEach((bh, i) => {
      holidays.push({
        id: `hol_${y}_${i}`,
        title: bh.title,
        date: `${y}${bh.datePattern}`,
        type: bh.type,
        description: bh.description,
      });
    });
  }
  return holidays;
};

// --- ID Generation ---

/**
 * Generates a unique ID for a new record.
 */
export const generateId = (prefix) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
};

// --- Execution Orchestration ---

/**
 * Standardized update logic for React state and API service.
 */
export const performDataUpdate = async (saveFn, setFn, updateFn, onError) => {
  return new Promise((resolve, reject) => {
    setFn((prev) => {
      const nextData = updateFn(prev);

      saveFn(nextData)
        .then(resolve)
        .catch((err) => {
          console.error('Background save failed:', err);
          if (onError) onError(err);
          reject(err);
        });

      return nextData;
    });
  });
};
