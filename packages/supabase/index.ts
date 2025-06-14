import { createClient } from '@supabase/supabase-js'
import { env } from "@topobre/env"
import { Database } from './types';

export * from './types';

export const supabaseClient = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
export const supabaseServer = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)