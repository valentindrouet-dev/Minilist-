-- Schema SQL pour Supabase
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

-- Table des figurines
CREATE TABLE figurines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT DEFAULT '',
  category TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  status TEXT DEFAULT 'unpainted' CHECK (status IN ('unpainted', 'wip', 'painted')),
  scale TEXT DEFAULT '28mm',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la recherche
CREATE INDEX idx_figurines_name ON figurines USING gin(to_tsvector('french', name));
CREATE INDEX idx_figurines_brand ON figurines(brand);
CREATE INDEX idx_figurines_category ON figurines(category);
CREATE INDEX idx_figurines_status ON figurines(status);
CREATE INDEX idx_figurines_tags ON figurines USING gin(tags);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_figurines_updated_at
  BEFORE UPDATE ON figurines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activer Row Level Security (optionnel, pour multi-utilisateurs)
-- ALTER TABLE figurines ENABLE ROW LEVEL SECURITY;

-- Storage bucket pour les images
-- À créer dans l'interface Supabase : Storage > New Bucket > "images" (public)

-- Politique de lecture publique pour le bucket images
-- INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
