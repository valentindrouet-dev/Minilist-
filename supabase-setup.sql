-- ============================================
-- MINILIST - Script de création Supabase
-- ============================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- (Dashboard > SQL Editor > New Query)
-- ============================================

-- 1. Créer la table figurines
CREATE TABLE IF NOT EXISTS figurines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  original_name TEXT DEFAULT '',
  category TEXT DEFAULT '',
  brand TEXT DEFAULT '',
  game TEXT DEFAULT '',
  collection TEXT DEFAULT '',
  universe TEXT DEFAULT '',
  species TEXT DEFAULT '',
  subspecies TEXT DEFAULT '',
  size TEXT DEFAULT 'Normal',
  alignment TEXT DEFAULT '',
  "group" TEXT DEFAULT '',
  habitats TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'unpainted',
  status_breakdown JSONB DEFAULT '[]',
  price DECIMAL(10,2),
  quantity INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  image_url TEXT,
  is_own_image BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_figurines_name ON figurines(name);
CREATE INDEX IF NOT EXISTS idx_figurines_brand ON figurines(brand);
CREATE INDEX IF NOT EXISTS idx_figurines_game ON figurines(game);
CREATE INDEX IF NOT EXISTS idx_figurines_status ON figurines(status);
CREATE INDEX IF NOT EXISTS idx_figurines_created_at ON figurines(created_at DESC);

-- 3. Activer Row Level Security (sécurité)
ALTER TABLE figurines ENABLE ROW LEVEL SECURITY;

-- 4. Créer une politique pour permettre l'accès public (lecture/écriture)
-- Note: Pour une app personnelle, c'est suffisant.
-- Pour multi-utilisateurs, il faudrait ajouter l'authentification.
CREATE POLICY "Allow all access" ON figurines
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Trigger pour updated_at automatique
DROP TRIGGER IF EXISTS update_figurines_updated_at ON figurines;
CREATE TRIGGER update_figurines_updated_at
  BEFORE UPDATE ON figurines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. (Optionnel) Créer un bucket pour les images
-- Allez dans Storage > Create bucket > Nom: "images" > Public: ON

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Après exécution, vérifiez que la table existe :
-- SELECT * FROM figurines LIMIT 1;
