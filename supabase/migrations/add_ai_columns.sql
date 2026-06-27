-- Ejecutar en el SQL Editor de Supabase para añadir columnas faltantes

ALTER TABLE poop_logs ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE poop_logs ADD COLUMN IF NOT EXISTS ai_bristol_type INT CHECK (ai_bristol_type BETWEEN 1 AND 7);
ALTER TABLE poop_logs ADD COLUMN IF NOT EXISTS ai_bristol_label TEXT;
ALTER TABLE poop_logs ADD COLUMN IF NOT EXISTS ai_pathology_risk TEXT;
ALTER TABLE poop_logs ADD COLUMN IF NOT EXISTS ai_recommendations TEXT;
ALTER TABLE poop_logs ADD COLUMN IF NOT EXISTS ai_analysis_raw TEXT;
ALTER TABLE poop_logs ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ;
