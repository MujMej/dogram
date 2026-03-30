-- ============================================
-- DOGRAM — Supabase Database Schema
-- Kopirati i pokrenuti u Supabase SQL Editor
-- ============================================


-- ─────────────────────────────────────────
-- 1. KORISNICI (proširuje Supabase Auth)
-- ─────────────────────────────────────────
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatski napravi profil kada se korisnik registruje
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ─────────────────────────────────────────
-- 2. PSI (srce aplikacije)
-- ─────────────────────────────────────────
CREATE TABLE dogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  breed TEXT,                        -- rasa
  is_mix BOOLEAN DEFAULT FALSE,      -- mješanac
  birth_date DATE,                   -- za izračun starosti
  weight_kg DECIMAL(5,2),
  gender TEXT CHECK (gender IN ('male', 'female')),
  is_neutered BOOLEAN DEFAULT FALSE, -- sterilizovan
  activity_level TEXT CHECK (activity_level IN ('low', 'medium', 'high')),
  bio TEXT,
  avatar_url TEXT,
  health_notes TEXT,
  is_public BOOLEAN DEFAULT TRUE,    -- vidljiv u feedu
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ─────────────────────────────────────────
-- 3. POSTOVI (feed)
-- ─────────────────────────────────────────
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  caption TEXT,
  image_url TEXT NOT NULL,
  location_name TEXT,                -- npr. "Park Ilidža"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lajkovi
CREATE TABLE post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)           -- jedan lajk po korisniku
);

-- Komentari
CREATE TABLE post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follow sistem
CREATE TABLE follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_dog_id)
);


-- ─────────────────────────────────────────
-- 4. AZILI & ADOPCIJA
-- ─────────────────────────────────────────
CREATE TABLE shelters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rescue_dogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shelter_id UUID REFERENCES shelters(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  breed TEXT,
  approximate_age TEXT,              -- npr. "~3 godine"
  gender TEXT CHECK (gender IN ('male', 'female')),
  weight_kg DECIMAL(5,2),
  description TEXT,
  temperament TEXT[],                -- npr. ['mirna', 'dobra s djecom']
  is_vaccinated BOOLEAN DEFAULT FALSE,
  is_neutered BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'available' 
    CHECK (status IN ('available', 'adopted', 'pending')),
  is_urgent BOOLEAN DEFAULT FALSE,
  images TEXT[],                     -- array URL-ova slika
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zahtjevi za usvajanje
CREATE TABLE adoption_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rescue_dog_id UUID REFERENCES rescue_dogs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ─────────────────────────────────────────
-- 5. MAPA LOKACIJA
-- ─────────────────────────────────────────
CREATE TABLE map_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'park', 'cafe', 'vet', 'grooming', 'pet_shop', 'other'
  )),
  address TEXT,
  city TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  description TEXT,
  phone TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(2,1),               -- prosječna ocjena
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ocjene lokacija
CREATE TABLE location_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES map_locations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, user_id)
);


-- ─────────────────────────────────────────
-- 6. PODSJETNICI
-- ─────────────────────────────────────────
CREATE TABLE reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'feeding', 'walk', 'water', 'vaccine', 'grooming', 'medicine', 'other'
  )),
  title TEXT NOT NULL,
  notes TEXT,
  time_of_day TIME,                  -- npr. 07:30
  repeat_type TEXT DEFAULT 'daily'
    CHECK (repeat_type IN ('once', 'daily', 'weekly', 'monthly')),
  repeat_days INTEGER[],             -- za weekly: [1,3,5] = pon,sri,pet
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log završenih podsjetnika
CREATE TABLE reminder_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);


-- ─────────────────────────────────────────
-- 7. DONACIJE
-- ─────────────────────────────────────────
CREATE TABLE donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  shelter_id UUID REFERENCES shelters(id) ON DELETE SET NULL,
  amount_bam DECIMAL(10,2) NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'completed'
    CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ─────────────────────────────────────────
-- 8. ROW LEVEL SECURITY (RLS)
-- Svako vidi samo ono što smije
-- ─────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;

-- Profili: javni za čitanje, własnik za pisanje
CREATE POLICY "Profili su javni" ON profiles FOR SELECT USING (true);
CREATE POLICY "Korisnik mijenja vlastiti profil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Psi: javni ako is_public = true
CREATE POLICY "Javni psi su vidljivi svima" ON dogs
  FOR SELECT USING (is_public = true OR auth.uid() = owner_id);
CREATE POLICY "Vlasnik upravlja psom" ON dogs
  FOR ALL USING (auth.uid() = owner_id);

-- Postovi: javni za čitanje
CREATE POLICY "Postovi su javni" ON posts FOR SELECT USING (true);
CREATE POLICY "Vlasnik upravlja postovima" ON posts
  FOR ALL USING (auth.uid() = owner_id);

-- Podsjetnici: privatni
CREATE POLICY "Vlastiti podsjetnici" ON reminders
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Vlastiti logovi" ON reminder_logs
  FOR ALL USING (
    auth.uid() = (SELECT owner_id FROM reminders WHERE id = reminder_id)
  );


-- ─────────────────────────────────────────
-- 9. KORISNI VIEWOVI (za lakše upite)
-- ─────────────────────────────────────────

-- Feed sa brojem lajkova
CREATE VIEW feed_posts AS
SELECT 
  p.*,
  d.name AS dog_name,
  d.breed AS dog_breed,
  d.avatar_url AS dog_avatar,
  pr.username AS owner_username,
  COUNT(DISTINCT pl.id) AS likes_count,
  COUNT(DISTINCT pc.id) AS comments_count
FROM posts p
JOIN dogs d ON p.dog_id = d.id
JOIN profiles pr ON p.owner_id = pr.id
LEFT JOIN post_likes pl ON p.id = pl.post_id
LEFT JOIN post_comments pc ON p.id = pc.post_id
GROUP BY p.id, d.name, d.breed, d.avatar_url, pr.username
ORDER BY p.created_at DESC;

-- Psi iz azila koji su dostupni
CREATE VIEW available_rescue_dogs AS
SELECT 
  rd.*,
  s.name AS shelter_name,
  s.city AS shelter_city,
  s.phone AS shelter_phone
FROM rescue_dogs rd
JOIN shelters s ON rd.shelter_id = s.id
WHERE rd.status = 'available'
ORDER BY rd.is_urgent DESC, rd.created_at DESC;

-- ============================================
-- GOTOVO! Supabase projekt je spreman.
-- Sljedeći korak: React frontend
-- ============================================
