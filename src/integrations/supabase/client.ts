// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bobajgsqysjrccszfimh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvYmFqZ3NxeXNqcmNjc3pmaW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5Njg0OTIsImV4cCI6MjA1NjU0NDQ5Mn0.kF689vcQLPUVt6qaM32Jt3A1JGMIScLmmIaVsB9gBOk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
