import { EndowSystem } from '../types/endow.types';

/**
 * Helper functions để xử lý endow system trong API
 */

export const processEndowForDatabase = (endow: any): any => {
  // Nếu endow là string, giữ nguyên (backward compatibility)
  if (typeof endow === 'string') {
    return endow;
  }

  // Nếu là EndowSystem object, stringify
  if (endow && typeof endow === 'object' && endow.items) {
    return JSON.stringify(endow);
  }

  // Nếu null/undefined, return null
  return null;
};

export const processEndowFromDatabase = (endow: any): EndowSystem | null => {
  if (!endow) return null;

  // Nếu đã là object, return nguyên
  if (typeof endow === 'object' && endow.items) {
    return endow as EndowSystem;
  }

  // Nếu là string, try parse
  if (typeof endow === 'string') {
    try {
      const parsed = JSON.parse(endow);
      // Kiểm tra xem có phải EndowSystem không
      if (parsed && typeof parsed === 'object' && parsed.items) {
        return parsed as EndowSystem;
      }

      // Legacy format - convert string to EndowSystem
      return {
        items: [
          {
            id: `legacy_${Date.now()}`,
            content: endow.trim(),
            isActive: true,
            priority: 1,
          },
        ],
        displaySettings: {
          showAsList: true,
          prefix: '• ',
          showInactive: false,
        },
      };
    } catch {
      // Parse failed - treat as legacy string
      return {
        items: [
          {
            id: `legacy_${Date.now()}`,
            content: endow.trim(),
            isActive: true,
            priority: 1,
          },
        ],
        displaySettings: {
          showAsList: true,
          prefix: '• ',
          showInactive: false,
        },
      };
    }
  }

  return null;
};

export const validateEndowSystem = (endowSystem: any): boolean => {
  if (!endowSystem) return true; // null/undefined is valid

  if (typeof endowSystem === 'string') return true; // string is valid (legacy)

  if (typeof endowSystem !== 'object') return false;

  if (!Array.isArray(endowSystem.items)) return false;

  return endowSystem.items.every(
    (item: any) =>
      item &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.content === 'string' &&
      item.content.trim().length > 0 &&
      typeof item.isActive === 'boolean',
  );
};
