
# Dokumentacja Aplikacji Budzika

## Spis treści

1.  [Opis projektu](#opis-projektu)
2.  [Struktura projektu](#struktura-projektu)
3.  [Główne funkcjonalności](#główne-funkcjonalności)
4.  [Komponenty interfejsu użytkownika (UI)](#komponenty-interfejsu-użytkownika-ui)
5.  [Hooki i zarządzanie stanem](#hooki-i-zarządzanie-stanem)
6.  [Typy danych](#typy-danych)
7.  [Funkcje pomocnicze (Utils)](#funkcje-pomocnicze-utils)
8.  [Konfiguracja](#konfiguracja)

---

## 1. Opis projektu

**SmartMath Alarm Clock** to aplikacja mobilna stworzona w React Native z użyciem Expo, która pełni funkcję inteligentnego budzika. Głównym celem aplikacji jest pomoc użytkownikom w skuteczniejszym budzeniu się poprzez wymaganie od nich rozwiązania prostego zadania matematycznego w celu wyłączenia alarmu.

Aplikacja pozwala na:
*   Tworzenie, edycję i usuwanie wielu alarmów.
*   Ustawianie alarmów na konkretną godzinę i dni tygodnia.
*   Możliwość ustawienia alarmu jednorazowego na konkretną datę.
*   Wybór dźwięku alarmu.
*   Włączenie/wyłączenie drzemki.
*   Aktywację **wyzwania matematycznego** o różnym poziomie trudności (łatwy, średni, trudny) jako warunku wyłączenia alarmu.

## 2. Struktura projektu

Projekt ma następującą strukturę katalogów:

```
/
├── app/                # Główne ekrany i nawigacja aplikacji (Expo Router)
│   ├── (tabs)/         # Układ zakładek (główny ekran z listą alarmów)
│   ├── alarm/          # Ekrany związane z zarządzaniem alarmami
│   └── ...
├── assets/             # Zasoby statyczne (ikony, obrazy)
├── components/         # Komponenty UI wielokrotnego użytku
├── constants/          # Stałe wartości (kolory, dźwięki alarmów)
├── hooks/              # Hooki Reacta (głównie do zarządzania stanem)
├── types/              # Definicje typów TypeScript
├── utils/              # Funkcje pomocnicze
└── ...                 # Pliki konfiguracyjne (package.json, tsconfig.json, etc.)
```

## 3. Główne funkcjonalności

### Nawigacja

Nawigacja w aplikacji jest oparta na **Expo Router**. Główne ścieżki to:
*   `/` (lub `/app/(tabs)`): Główny ekran z listą alarmów.
*   `/alarm/new`: Ekran tworzenia nowego alarmu (modal).
*   `/alarm/[id]`: Ekran edycji istniejącego alarmu (modal).
*   `/alarm/active`: Ekran aktywnego alarmu, który dzwoni (pełnoekranowy modal).

### Zarządzanie alarmami

Logika biznesowa związana z alarmami znajduje się w hooku `useAlarmStore`. Obejmuje ona:
*   **Dodawanie, aktualizowanie i usuwanie** alarmów.
*   **Przechowywanie** alarmów w pamięci urządzenia (`AsyncStorage`).
*   **Sprawdzanie co minutę**, czy któryś z aktywnych alarmów powinien się włączyć.
*   Obsługę **aktywnego alarmu**, w tym logikę drzemki i wyłączania.

## 4. Komponenty interfejsu użytkownika (UI)

Wszystkie komponenty znajdują się w katalogu `components/`.

*   `AlarmListItem.tsx`: Wyświetla pojedynczy alarm na liście. Zawiera godzinę, etykietę, dni tygodnia, przełącznik do włączania/wyłączania oraz wskaźnik odliczania do następnego dzwonka.
*   `AlarmCountdown.tsx`: Mały komponent w `AlarmListItem`, który pokazuje, za ile czasu włączy się dany alarm.
*   `DatePickerModal.tsx`: Modal do wyboru konkretnej daty dla alarmu jednorazowego.
*   `TimePickerModal.tsx`: Modal do ustawiania godziny alarmu.
*   `DaySelector.tsx`: Komponent do wyboru dni tygodnia, w które alarm ma się powtarzać.
*   `ToneSelector.tsx`: Umożliwia wybór dźwięku alarmu z predefiniowanej listy. Pozwala na odsłuchanie dźwięku przed wyborem.
*   `MathChallenge.tsx`: Komponent wyświetlający zadanie matematyczne. Pojawia się na ekranie aktywnego alarmu, jeśli opcja jest włączona.

## 5. Hooki i zarządzanie stanem

*   `hooks/useAlarmStore.ts`: Centralny punkt zarządzania stanem alarmów. Używa biblioteki `@tanstack/react-query` do pobierania i zapisywania danych oraz `create-context-hook` do udostępniania stanu w całej aplikacji.
    *   `useAlarms`: Główny hook zwracający listę alarmów oraz funkcje do manipulacji nimi (dodawanie, usuwanie, etc.).
    *   `useSortedAlarms`: Pomocniczy hook, który zwraca alarmy posortowane według statusu (włączone najpierw), a następnie według godziny.

## 6. Typy danych

Definicje typów znajdują się w `types/alarm.ts`.

*   `WeekDay`: Typ wyliczeniowy dla dni tygodnia (`'monday'`, `'tuesday'`, etc.).
*   `Alarm`: Główny interfejs opisujący strukturę pojedynczego alarmu. Zawiera m.in. `id`, `time`, `enabled`, `label`, `days`, `tone` i opcje związane z drzemką i wyzwaniem matematycznym.
*   `ActiveAlarm`: Rozszerzenie interfejsu `Alarm`, używane, gdy alarm dzwoni. Dodaje pola `snoozeCount` i `isSnoozing`.

## 7. Funkcje pomocnicze (Utils)

*   `utils/dateUtils.ts`: Zestaw funkcji do operacji na datach i czasie.
    *   `formatTime`: Formatuje czas z formatu "HH:MM" na "h:mm A/PM".
    *   `getCurrentTime`: Zwraca aktualny czas w formacie "HH:MM".
    *   `getDayOfWeek`: Zwraca aktualny dzień tygodnia.
    *   `getNextAlarmTime`: Oblicza dokładną datę i godzinę następnego dzwonka dla danego alarmu.
*   `utils/mathChallengeUtils.ts`: Funkcje do generowania zadań matematycznych.
    *   `generateMathChallenge`: Tworzy zadanie (`question`) i jego rozwiązanie (`answer`) w zależności od wybranego poziomu trudności.

## 8. Konfiguracja

*   `app.json`: Plik konfiguracyjny Expo. Definiuje m.in. nazwę aplikacji, ikony, ekran powitalny, uprawnienia (np. do wibracji, audio) oraz pluginy.
*   `package.json`: Definiuje zależności projektu (np. `expo`, `react`, `lucide-react-native`) oraz skrypty startowe.
*   `tsconfig.json`: Konfiguracja TypeScript, w tym aliasy ścieżek (`@/*`).
