// Define types for level configuration

export interface LevelDefinition {
  id: number;
  title: string;
  description: string;
  locked?: boolean;
  availableKeys: string[];
}

export interface LevelProps {
  isMuted: boolean;
}

export const createCustomLevel = (
  id: number,
  title: string,
  description: string,
  availableKeys: string[],
  locked: boolean = false
): LevelDefinition => {
  return {
    id,
    title,
    description,
    availableKeys,
    locked
  };
};
