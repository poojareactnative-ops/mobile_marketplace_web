/**
 * Supabase Client Configuration & Universal Connector
 * Works seamlessly with both @supabase/supabase-js and pure REST/PostgREST
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gpvyatfnnkrsrckarxbh.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdnlhdGZubmtyc3Jja2FyeGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTEyNzIsImV4cCI6MjEwODg2NzI3Mn0.1v5HSfsgDA-rWVKb6ftLO-fjQg6Cp2y4wtsNp9H9j9A';

let supabaseClient = null;

try {
  const { createClient } = require('@supabase/supabase-js');
  if (createClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  // @supabase/supabase-js not installed in node_modules yet, fallback to direct REST
  supabaseClient = null;
}

/**
 * Universal PostgREST REST client wrapper for Supabase
 */
export async function supabaseRest(endpoint, options = {}) {
  const method = options.method || 'GET';
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': options.prefer || 'return=representation',
    ...(options.headers || {}),
  };

  const url = endpoint.startsWith('http') ? endpoint : `${SUPABASE_URL}/rest/v1/${endpoint.replace(/^\//, '')}`;
  
  const config = {
    method,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.message || data?.hint || data?.details || `Supabase request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.name === 'TypeError') {
      console.warn(`[Supabase Error]: Could not connect to "${SUPABASE_URL}". Please verify that your Supabase project is active and unpaused in your Supabase dashboard.`);
    }
    throw err;
  }
}

export const supabase = supabaseClient;
export { SUPABASE_URL, SUPABASE_ANON_KEY };
export default supabase;

