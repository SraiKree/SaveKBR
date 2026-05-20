import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client, with a graceful fallback for local development.
 *
 * Why the stub?  `@supabase/supabase-js` throws "supabaseUrl is required."
 * the moment you call `createClient(undefined, undefined)`. Because this
 * module is imported transitively by pages and hooks at the very top of
 * the app, a missing `.env` blew up React before it could mount → blank
 * white screen with no visible cause.
 *
 * Now, when either env var is missing we:
 *   1. Print a loud warning to the console so the developer knows.
 *   2. Hand back a thenable stub whose query methods resolve to an empty
 *      dataset and whose mutating methods return a descriptive error.
 *      The UI keeps rendering (map shows "no incidents", form shows the
 *      error inline) instead of crashing the whole tree.
 *
 * To switch on the real client, create a `.env` file in the project root
 * containing:
 *
 *   VITE_SUPABASE_URL=https://<project>.supabase.co
 *   VITE_SUPABASE_ANON_KEY=<anon-key-from-supabase-dashboard>
 *
 * and restart `vite`.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function makeStubClient(reason) {
  // eslint-disable-next-line no-console
  console.warn(
    `[supabase] ${reason}. Using offline stub — incidents will be empty and ` +
    `mutations will fail with a friendly error. Add VITE_SUPABASE_URL and ` +
    `VITE_SUPABASE_ANON_KEY to .env and restart vite to enable the real client.`
  );

  const err = { message: 'Supabase is not configured. Add VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to .env.' };

  /* A chainable query builder that always resolves to "no rows".
   * Each method returns the same object so `.select().eq().order()` etc.
   * can keep being chained without anyone needing to know it's a stub. */
  const emptyQuery = () => {
    const result = { data: [], error: null };
    const chain = {
      select: () => chain,
      eq: () => chain,
      neq: () => chain,
      gt: () => chain,
      lt: () => chain,
      gte: () => chain,
      lte: () => chain,
      in: () => chain,
      order: () => chain,
      limit: () => chain,
      single: () => Promise.resolve(result),
      maybeSingle: () => Promise.resolve(result),
      then: (onFulfilled, onRejected) => Promise.resolve(result).then(onFulfilled, onRejected),
    };
    return chain;
  };

  const errorOp = () => {
    const chain = {
      select: () => chain,
      eq: () => chain,
      single: () => Promise.resolve({ data: null, error: err }),
      maybeSingle: () => Promise.resolve({ data: null, error: err }),
      then: (onFulfilled) => Promise.resolve({ data: null, error: err }).then(onFulfilled),
    };
    return chain;
  };

  return {
    from: () => ({
      select: emptyQuery().select,
      insert: errorOp,
      update: errorOp,
      delete: errorOp,
      upsert: errorOp,
    }),
    channel: () => ({
      on: function () { return this; },
      subscribe: function () { return this; },
    }),
    removeChannel: () => {},
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  };
}

let client;
if (!supabaseUrl || !supabaseKey) {
  client = makeStubClient(
    !supabaseUrl && !supabaseKey
      ? 'Missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
      : !supabaseUrl
        ? 'Missing VITE_SUPABASE_URL'
        : 'Missing VITE_SUPABASE_ANON_KEY'
  );
} else {
  client = createClient(supabaseUrl, supabaseKey);
}

export const supabase = client;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
