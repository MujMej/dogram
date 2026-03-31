import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rkrkpsqkniesgnwgoxpm.supabase.co'
const supabaseAnonKey = 'sb_publishable_8N_ZF_jmB0EQIX1ppfdcIw_p_nDbOs9'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
