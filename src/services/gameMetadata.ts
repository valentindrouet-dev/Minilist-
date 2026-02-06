// Storage for game-specific metadata (cover images, etc.)
// This is separate from figurines data

const GAME_METADATA_KEY = 'minilist_game_metadata';

export interface GameMetadata {
  coverImage: string | null;
}

type GameMetadataStore = Record<string, GameMetadata>;

function getGameMetadataStore(): GameMetadataStore {
  const stored = localStorage.getItem(GAME_METADATA_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }
  return {};
}

function saveGameMetadataStore(store: GameMetadataStore): void {
  localStorage.setItem(GAME_METADATA_KEY, JSON.stringify(store));
}

export function getGameMetadata(gameName: string): GameMetadata | null {
  const store = getGameMetadataStore();
  return store[gameName] || null;
}

export function setGameCoverImage(gameName: string, coverImage: string | null): void {
  const store = getGameMetadataStore();
  if (!store[gameName]) {
    store[gameName] = { coverImage: null };
  }
  store[gameName].coverImage = coverImage;
  saveGameMetadataStore(store);
}

export function getAllGameMetadata(): GameMetadataStore {
  return getGameMetadataStore();
}
