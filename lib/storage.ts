export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
    }
  }
  return defaultValue;
}

export function clearStorage(key: string): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  }
}

