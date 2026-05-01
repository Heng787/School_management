const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env');

const isTest = process.env.NODE_ENV === 'test';

const supabase = isTest 
  ? require('./supabase-mock') 
  : createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);

module.exports = supabase;
