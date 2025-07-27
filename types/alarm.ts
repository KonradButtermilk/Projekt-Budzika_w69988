/**
 * Typ wyliczeniowy reprezentujący dni tygodnia.
 */
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/**
 * Główny interfejs reprezentujący pojedynczy alarm i jego konfigurację.
 */
export interface Alarm {
  id: string;                      // Unikalny identyfikator alarmu
  time: string;                    // Czas alarmu w formacie "HH:MM"
  enabled: boolean;                // Czy alarm jest włączony?
  label?: string;                  // Opcjonalna etykieta alarmu
  days: WeekDay[];                 // Dni tygodnia, w które alarm ma się powtarzać
  tone: string;                    // ID wybranego dźwięku alarmu
  snoozeEnabled: boolean;          // Czy drzemka jest włączona?
  snoozeDuration: number;          // Czas trwania drzemki w minutach
  mathChallengeEnabled: boolean;   // Czy wyzwanie matematyczne jest włączone?
  mathChallengeDifficulty: 'easy' | 'medium' | 'hard'; // Poziom trudności wyzwania
  specificDate?: Date;             // Opcjonalna konkretna data dla alarmu jednorazowego
}

/**
 * Interfejs reprezentujący alarm, który aktualnie dzwoni.
 * Rozszerza standardowy interfejs `Alarm` o informacje o stanie drzemki.
 */
export interface ActiveAlarm extends Alarm {
  snoozeCount: number;             // Liczba aktywowanych drzemek
  isSnoozing: boolean;             // Czy alarm jest aktualnie w trybie drzemki?
}
