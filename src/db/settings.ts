import { db, type Setting } from "./index";

export type ReaderPreferences = {
  fontSize: number;
  lineWidth: number;
  darkMode: boolean;
};

const READER_PREFERENCES_ID = "reader_preferences";

export const defaultReaderPreferences: ReaderPreferences = {
  fontSize: 1.05,
  lineWidth: 72,
  darkMode: false,
};

const getSetting = async (id: string): Promise<Setting | undefined> =>
  db.settings.get(id);

const setSetting = async (id: string, value: string): Promise<void> => {
  await db.settings.put({ id, value });
};

export const getReaderPreferences = async (): Promise<ReaderPreferences> => {
  const setting = await getSetting(READER_PREFERENCES_ID);

  if (!setting) {
    return defaultReaderPreferences;
  }

  try {
    const parsed = JSON.parse(setting.value) as ReaderPreferences;
    return {
      ...defaultReaderPreferences,
      ...parsed,
    };
  } catch {
    return defaultReaderPreferences;
  }
};

export const setReaderPreferences = async (
  preferences: ReaderPreferences,
): Promise<void> => {
  await setSetting(READER_PREFERENCES_ID, JSON.stringify(preferences));
};
