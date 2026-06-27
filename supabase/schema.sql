-- PoopLog - Schema de base de datos Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de registros de deposiciones
CREATE TABLE IF NOT EXISTS poop_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL,
  color TEXT NOT NULL,
  duration_minutes INT,
  pain_level INT CHECK (pain_level BETWEEN 0 AND 5),
  had_blood BOOLEAN DEFAULT FALSE,
  had_straining BOOLEAN DEFAULT FALSE,
  satisfaction_level INT CHECK (satisfaction_level BETWEEN 1 AND 5),
  notes TEXT,
  emoji TEXT,
  -- Columnas de análisis IA
  photo_url TEXT,
  ai_bristol_type INT CHECK (ai_bristol_type BETWEEN 1 AND 7),
  ai_bristol_label TEXT,
  ai_pathology_risk TEXT,
  ai_recommendations TEXT,
  ai_analysis_raw TEXT,
  ai_analyzed_at TIMESTAMPTZ
);

-- Row Level Security - Perfiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Row Level Security - Logs
ALTER TABLE poop_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own logs" ON poop_logs
  FOR ALL USING (auth.uid() = user_id);

-- Bucket de avatares en Supabase Storage (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Bucket de fotos de deposiciones (privado)
INSERT INTO storage.buckets (id, name, public)
VALUES ('poop-photos', 'poop-photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can manage own photos" ON storage.objects
  FOR ALL USING (
    bucket_id = 'poop-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
