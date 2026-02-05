import type { Figurine, FigurineInput } from '../types';

// Utilise le point-virgule comme séparateur pour Excel français
const DELIMITER = ';';

const CSV_HEADERS = [
  'name',
  'category',
  'brand',
  'game',
  'collection',
  'group',
  'universe',
  'species',
  'subspecies',
  'size',
  'alignment',
  'habitats',
  'status',
  'price',
  'quantity',
  'tags',
  'notes',
  'image_url',
] as const;

const CSV_TEMPLATE_CONTENT = `name;category;brand;game;collection;group;universe;species;subspecies;size;alignment;habitats;status;price;quantity;tags;notes;image_url
Space Marine Intercessor;Figurines;Games Workshop;Warhammer 40K;Kill Team;Ultramarines;Warhammer 40K;Humain;;Normal;Loyal Bon;;painted;35.00;5;space marine,ultramarines,sci-fi;Peint en bleu Ultramarine;
Goblin Archer;Figurines;Reaper Miniatures;;Pathfinder Battles;;D&D / Pathfinder;Hybride;Gobelin;Petit;Chaotique Mauvais;Forêt;unpainted;4.50;10;gobelin,archer,fantasy;;
Dragon Rouge;Impression 3D;;;;;Fantasy;Dragon;;Gigantesque;Chaotique Neutre;Montagne,Grotte;wip;;1;dragon,boss,epic;En cours de peinture - base rouge faite;
`;

function escapeCSVField(field: string): string {
  if (field.includes(DELIMITER) || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function parseCSVLine(line: string, delimiter: string = DELIMITER): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }

  result.push(current.trim());
  return result;
}

// Détecte automatiquement le délimiteur utilisé (virgule ou point-virgule)
function detectDelimiter(firstLine: string): string {
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  return semicolonCount >= commaCount ? ';' : ',';
}

export function generateCSVTemplate(): string {
  return CSV_TEMPLATE_CONTENT;
}

export function exportToCSV(figurines: Figurine[]): string {
  const lines: string[] = [CSV_HEADERS.join(DELIMITER)];

  for (const fig of figurines) {
    const row = [
      escapeCSVField(fig.name || ''),
      escapeCSVField(fig.category || ''),
      escapeCSVField(fig.brand || ''),
      escapeCSVField(fig.game || ''),
      escapeCSVField(fig.collection || ''),
      escapeCSVField(fig.group || ''),
      escapeCSVField(fig.universe || ''),
      escapeCSVField(fig.species || ''),
      escapeCSVField(fig.subspecies || ''),
      escapeCSVField(fig.size || 'Normal'),
      escapeCSVField(fig.alignment || ''),
      escapeCSVField((fig.habitats || []).join(',')), // Virgules pour les habitats
      escapeCSVField(fig.status || ''),
      escapeCSVField(fig.price != null ? String(fig.price) : ''),
      escapeCSVField(String(fig.quantity || 1)),
      escapeCSVField((fig.tags || []).join(',')), // Virgules pour les tags car ; est le séparateur
      escapeCSVField(fig.notes || ''),
      escapeCSVField(fig.image_url || ''),
    ];
    lines.push(row.join(DELIMITER));
  }

  return lines.join('\n');
}

export function parseCSV(csvContent: string): FigurineInput[] {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('Le fichier CSV doit contenir au moins un en-tête et une ligne de données');
  }

  // Détecte automatiquement le délimiteur
  const delimiter = detectDelimiter(lines[0]);

  const headers = parseCSVLine(lines[0], delimiter).map(h => h.toLowerCase().trim());

  // Validate required header
  if (!headers.includes('name')) {
    throw new Error('La colonne "name" est requise');
  }

  const figurines: FigurineInput[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter);

    if (values.every(v => !v.trim())) {
      continue; // Skip empty lines
    }

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    const name = row['name']?.trim();
    if (!name) {
      continue; // Skip rows without name
    }

    // Parse tags (support both ; and , as separators within the tags field)
    const tagsString = row['tags'] || '';
    const tags = tagsString
      .split(/[,]/) // Utilise la virgule pour séparer les tags
      .map(t => t.trim())
      .filter(t => t.length > 0);

    // Parse habitats (support both ; and , as separators)
    const habitatsString = row['habitats'] || row['habitat'] || ''; // Support old "habitat" field
    const habitats = habitatsString
      .split(/[,]/)
      .map(h => h.trim())
      .filter(h => h.length > 0);

    const figurine: FigurineInput = {
      name,
      category: row['category'] || '',
      brand: row['brand'] || '',
      game: row['game'] || '',
      collection: row['collection'] || '',
      group: row['group'] || '',
      universe: row['universe'] || '',
      species: row['species'] || '',
      subspecies: row['subspecies'] || '',
      size: row['size'] || 'Normal',
      alignment: row['alignment'] || '',
      habitats,
      status: row['status'] || 'unpainted',
      price: row['price'] ? parseFloat(row['price']) : null,
      quantity: parseInt(row['quantity']) || 1,
      tags,
      notes: row['notes'] || '',
      image_url: row['image_url'] || null,
    };

    figurines.push(figurine);
  }

  if (figurines.length === 0) {
    throw new Error('Aucune figurine valide trouvée dans le fichier');
  }

  return figurines;
}

export async function importFigurinesFromCSV(
  csvContent: string,
  addFigurine: (input: FigurineInput) => Promise<Figurine>
): Promise<{ success: number; errors: string[] }> {
  const figurines = parseCSV(csvContent);
  const errors: string[] = [];
  let success = 0;

  for (const figurine of figurines) {
    try {
      await addFigurine(figurine);
      success++;
    } catch (error) {
      errors.push(`Erreur pour "${figurine.name}": ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  return { success, errors };
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv') {
  const blob = new Blob(['\ufeff' + content], { type: `${mimeType};charset=utf-8` }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
