import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://krxkpozvfuzqrknddbfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyeGtwb3p2ZnV6cXJrbmRkYmZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjczODgsImV4cCI6MjA5NDk0MzM4OH0.TVS-YJpmAFvuM2H7BVT2yEG6dj_B0oMRr5gKpj0JpgI'
)
