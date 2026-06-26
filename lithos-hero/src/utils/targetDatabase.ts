export interface TargetData {
  id: string;
  grid: string;
  altitude: number;
  description: string;
}

const STORAGE_KEY = 'lithos_target_database';

export function getTargets(): TargetData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load targets from local storage", error);
  }
  return [];
}

export function saveTargets(targets: TargetData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(targets));
  } catch (error) {
    console.error("Failed to save targets to local storage", error);
  }
}

export function addTarget(target: TargetData): void {
  const currentTargets = getTargets();
  // Check if ID already exists
  const existingIndex = currentTargets.findIndex(t => t.id === target.id);
  if (existingIndex >= 0) {
    currentTargets[existingIndex] = target; // Update existing
  } else {
    currentTargets.push(target); // Add new
  }
  saveTargets(currentTargets);
}

export function removeTarget(id: string): void {
  const currentTargets = getTargets();
  const filtered = currentTargets.filter(t => t.id !== id);
  saveTargets(filtered);
}

export function clearAllTargets(): void {
  localStorage.removeItem(STORAGE_KEY);
}
