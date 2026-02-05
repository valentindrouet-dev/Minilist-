import type { Figurine, FigurineInput } from '../types';

const CSV_HEADERS = [
  'name',
  'brand',
  'category',
  'subcategory',
  'universe',
  'status',
  'scale',
  'tags',
  'notes',
  'image_url',
] as const;

const CSV_TEMPLATE_CONTENT = `name,brand,category,subcategory,universe,status,scale,tags,notes,image_url
Space Marine Intercessor,Games Workshop,Infanterie,Humain,Warhammer 40K,painted,28mm,"space marine;ultramarines;sci-fi",Peint en bleu Ultramarine,
Goblin Archer,Reaper Miniatures,Infanterie,Gobelin,D&D / Pathfinder,unpainted,28mm,"gobelin;archer;fantasy",,
Dragon Rouge,Impression 3D,Monstre / Créature,Dragon,D&D / Pathfinder,wip,75mm,"dragon;boss;epic",En cours de peinture - base rouge faite,
`;

function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function parseCSVLine(line: string): string[] {
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
      } else if (char === ',') {
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

export function generateCSVTemplate(): string {
  return CSV_TEMPLATE_CONTENT;
}

export function exportToCSV(figurines: Figurine[]): string {
  const lines: string[] = [CSV_HEADERS.join(',')];

  for (const fig of figurines) {
    const row = [
      escapeCSVField(fig.name || ''),
      escapeCSVField(fig.brand || ''),
      escapeCSVField(fig.category || ''),
      escapeCSVField(fig.subcategory || ''),
      escapeCSVField(fig.universe || ''),
      escapeCSVField(fig.status || ''),
      escapeCSVField(fig.scale || ''),
      escapeCSVField((fig.tags || []).join(';')),
      escapeCSVField(fig.notes || ''),
      escapeCSVField(fig.image_url || ''),
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

export function parseCSV(csvContent: string): FigurineInput[] {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('Le fichier CSV doit contenir au moins un en-tête et une ligne de données');
  }

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

  // Validate required header
  if (!headers.includes('name')) {
    throw new Error('La colonne "name" est requise');
  }

  const figurines: FigurineInput[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

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

    // Parse tags (support both ; and , as separators)
    const tagsString = row['tags'] || '';
    const tags = tagsString
      .split(/[;,]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const figurine: FigurineInput = {
      name,
      brand: row['brand'] || '',
      category: row['category'] || '',
      subcategory: row['subcategory'] || '',
      universe: row['universe'] || '',
      status: row['status'] || 'unpainted',
      scale: row['scale'] || '28mm',
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
