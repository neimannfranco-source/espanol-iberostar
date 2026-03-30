import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://auvwxumxigpvuxyijkjo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dnd4dW14aWdwdnV4eWlqa2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTg0NzUsImV4cCI6MjA5MDQ3NDQ3NX0.32snQ5gKglZ6cET8x_vU8zQg-v0F0pEdAOGV1PaOEQ0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);