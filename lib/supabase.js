import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kwodheugyhtazmzlcwwn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3b2RoZXVneWh0YXptemxjd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NDQ5OTQsImV4cCI6MjA5MDIyMDk5NH0.cf7vInHwo2ltckMSM8SDK-_cgRKH-eg7gN_FVR36ceE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
