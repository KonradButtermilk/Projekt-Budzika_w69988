import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Interfejs definiujący strukturę obiektu dźwięku alarmu.
 */
export interface AlarmTone {
  id: string;      // Unikalny identyfikator
  name: string;    // Nazwa wyświetlana w UI
  url: string;      // Adres URL do pliku dźwiękowego
  isCustom?: boolean; // Flaga oznaczająca, czy to własny dźwięk użytkownika
}

/**
 * Lista predefiniowanych dźwięków alarmów dostępnych w aplikacji.
 */
export const alarmTones: AlarmTone[] = [
  {
    id: 'default',
    name: 'Default',
    url: 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3',
  },
  {
    id: 'digital',
    name: 'Digital',
    url: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
  },
  {
    id: 'classic',
    name: 'Classic',
    url: 'https://assets.mixkit.co/active_storage/sfx/1028/1028-preview.mp3',
  },
  {
    id: 'gentle',
    name: 'Gentle',
    url: 'https://assets.mixkit.co/active_storage/sfx/2474/2474-preview.mp3',
  },
  {
    id: 'nature',
    name: 'Nature',
    url: 'https://assets.mixkit.co/active_storage/sfx/2532/2532-preview.mp3',
  },
];

/**
 * Zwraca obiekt dźwięku alarmu na podstawie jego ID.
 * Jeśli dźwięk o danym ID nie zostanie znaleziony, zwraca dźwięk domyślny.
 * @param id - ID szukanego dźwięku.
 * @returns Obiekt AlarmTone.
 */
// Klucz do przechowywania własnych dźwięków
const CUSTOM_TONES_KEY = 'custom_alarm_tones';

// Funkcja do pobierania własnych dźwięków z AsyncStorage
export const getCustomTones = async (): Promise<AlarmTone[]> => {
  try {
    const storedTones = await AsyncStorage.getItem(CUSTOM_TONES_KEY);
    return storedTones ? JSON.parse(storedTones) : [];
  } catch (error) {
    console.error('Error loading custom tones:', error);
    return [];
  }
};

// Funkcja do zapisywania własnych dźwięków
export const saveCustomTones = async (tones: AlarmTone[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CUSTOM_TONES_KEY, JSON.stringify(tones));
  } catch (error) {
    console.error('Error saving custom tones:', error);
  }
};

// Funkcja do dodawania nowego własnego dźwięku
export const addCustomTone = async (newTone: AlarmTone): Promise<void> => {
  const customTones = await getCustomTones();
  await saveCustomTones([...customTones, newTone]);
};

export const getAlarmToneById = async (id: string): Promise<AlarmTone> => {
  // Najpierw sprawdź predefiniowane dźwięki
  const predefinedTone = alarmTones.find(tone => tone.id === id);
  if (predefinedTone) return predefinedTone;

  // Jeśli nie znaleziono w predefiniowanych, sprawdź własne dźwięki
  const customTones = await getCustomTones();
  const customTone = customTones.find(tone => tone.id === id);
  
  // Jeśli nie znaleziono nigdzie, zwróć domyślny
  return customTone || alarmTones[0];
};
