module.exports = {
  from: () => ({
    select: () => ({
      or: () => ({
        limit: () => ({
          single: () => Promise.resolve({ data: null, error: null, count: 0 }),
          maybeSingle: () => Promise.resolve({ data: null, error: null, count: 0 })
        }),
        order: () => ({
          limit: () => ({
            single: () => Promise.resolve({ data: null, error: null, count: 0 })
          })
        })
      }),
      eq: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null })
      }),
      order: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null }),
    delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    update: () => ({ eq: () => Promise.resolve({ error: null }) }),
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: {}, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: 'http://mock-url' } })
    })
  },
  auth: {
    getUser: () => Promise.resolve({ data: { user: {} }, error: null }),
    signIn: () => Promise.resolve({ data: {}, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  }
};
