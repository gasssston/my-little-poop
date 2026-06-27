-- My Little Poop - Schema de base de datos Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  search_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  had_splash BOOLEAN DEFAULT FALSE,
  had_farts BOOLEAN DEFAULT FALSE,
  satisfaction_level INT CHECK (satisfaction_level BETWEEN 1 AND 5),
  notes TEXT,
  emoji TEXT,
  photo_url TEXT,
  ai_bristol_type INT CHECK (ai_bristol_type BETWEEN 1 AND 7),
  ai_bristol_label TEXT,
  ai_pathology_risk TEXT,
  ai_recommendations TEXT,
  ai_analysis_raw TEXT,
  ai_analyzed_at TIMESTAMPTZ
);

-- ============================================================
-- RLS - PROFILES Y POOP_LOGS
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

ALTER TABLE poop_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own logs" ON poop_logs;
CREATE POLICY "Users can manage own logs" ON poop_logs
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- BUCKETS DE STORAGE
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

INSERT INTO storage.buckets (id, name, public)
VALUES ('poop-photos', 'poop-photos', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can manage own photos" ON storage.objects;
CREATE POLICY "Users can manage own photos" ON storage.objects
  FOR ALL USING (
    bucket_id = 'poop-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- TRIGGER - Perfil automático al registrarse
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, search_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    lower(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(
      COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
      'á','a'), 'é','e'), 'í','i'), 'ó','o'), 'ú','u'),
      'Á','A'), 'É','E'), 'Í','I'), 'Ó','O'), 'Ú','U'))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLA DE AMISTADES
-- ============================================================

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own friendships" ON friendships;
CREATE POLICY "Users see own friendships" ON friendships
  FOR ALL USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ============================================================
-- TABLA DE NOTIFICACIONES
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('friend_request', 'friend_accepted', 'friend_pooped', 'streak_milestone')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own notifications" ON notifications;
CREATE POLICY "Users see own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow insert notifications" ON notifications;
CREATE POLICY "Allow insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- FUNCIONES Y VIEWS
-- ============================================================

-- Función de búsqueda por nombre y email (sin tildes)
CREATE OR REPLACE FUNCTION search_users(query TEXT)
RETURNS TABLE(id UUID, name TEXT, email TEXT, avatar_url TEXT) AS $$
  DECLARE
    q TEXT := lower(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(
      query,
      'á','a'), 'é','e'), 'í','i'), 'ó','o'), 'ú','u'),
      'Á','A'), 'É','E'), 'Í','I'), 'Ó','O'), 'Ú','U'));
  BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.email, p.avatar_url
    FROM profiles p
    WHERE p.search_name ILIKE '%' || q || '%'
       OR lower(p.email) ILIKE '%' || lower(query) || '%'
    LIMIT 10;
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_streak(uid UUID)
RETURNS INT AS $$
DECLARE
  streak INT := 0;
  check_date DATE := CURRENT_DATE;
BEGIN
  LOOP
    IF EXISTS (
      SELECT 1 FROM poop_logs
      WHERE user_id = uid
        AND DATE(logged_at) = check_date
    ) THEN
      streak := streak + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  RETURN streak;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE VIEW friend_leaderboard AS
SELECT
  p.id AS user_id,
  p.name,
  p.avatar_url,
  COUNT(CASE WHEN pl.logged_at >= date_trunc('week', NOW()) THEN 1 END) AS poops_this_week,
  COUNT(CASE WHEN pl.logged_at >= date_trunc('month', NOW()) THEN 1 END) AS poops_this_month,
  ROUND(AVG(pl.satisfaction_level), 1) AS avg_satisfaction,
  get_user_streak(p.id) AS current_streak
FROM profiles p
LEFT JOIN poop_logs pl ON pl.user_id = p.id
GROUP BY p.id, p.name, p.avatar_url;

-- ============================================================
-- TRIGGER DE NOTIFICACIONES
-- ============================================================

CREATE OR REPLACE FUNCTION notify_friends_on_poop()
RETURNS TRIGGER AS $$
DECLARE
  friend_id UUID;
  actor_name TEXT;
  actor_emoji TEXT;
BEGIN
  SELECT name INTO actor_name FROM profiles WHERE id = NEW.user_id;
  actor_emoji := COALESCE(NEW.emoji, '💩');

  FOR friend_id IN
    SELECT CASE
      WHEN requester_id = NEW.user_id THEN addressee_id
      ELSE requester_id
    END
    FROM friendships
    WHERE (requester_id = NEW.user_id OR addressee_id = NEW.user_id)
      AND status = 'accepted'
  LOOP
    INSERT INTO notifications (user_id, actor_id, type, message, metadata)
    VALUES (
      friend_id,
      NEW.user_id,
      'friend_pooped',
      actor_name || ' acaba de hacer una caca ' || actor_emoji,
      jsonb_build_object('log_id', NEW.id, 'emoji', NEW.emoji)
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_poop_logged ON poop_logs;
CREATE TRIGGER on_poop_logged
  AFTER INSERT ON poop_logs
  FOR EACH ROW EXECUTE FUNCTION notify_friends_on_poop();

-- ============================================================
-- REALTIME
-- ============================================================

ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE friendships REPLICA IDENTITY FULL;
