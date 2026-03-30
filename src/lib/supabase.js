import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'OVDJE_STAVI_SVOJ_SUPABASE_URL'
const supabaseAnonKey = 'OVDJE_STAVI_SVOJ_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
