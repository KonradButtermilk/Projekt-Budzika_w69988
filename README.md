# Aplikacja Budzika

Zaawansowana aplikacja budzika zbudowana przy użyciu React Native i Expo, oferująca szereg funkcji ułatwiających zarządzanie alarmami i budzenie.

## Funkcje

-  Intuicyjne ustawianie alarmów
- Alarmy cykliczne (wybór dni tygodnia)
- Własne dźwięki alarmów
- Wyzwania matematyczne do wyłączenia alarmu
- Funkcja drzemki
- Wsparcie dla wielu platform (iOS, Android, Web)

## Technologie

- React Native
- Expo
- TypeScript
- AsyncStorage do persystencji danych
- React Navigation
- Expo AV do obsługi dźwięku

## Uruchomienie Projektu

1. Sklonuj repozytorium:
```bash
git clone https://github.com/KonradButtermilk/Projekt-Budzika_w69988.git
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Uruchom aplikację:
```bash
npx expo start
```

## Struktura Projektu

```
.
├── app/                    # Główne komponenty routingu
├── assets/                 # Zasoby (obrazy, dźwięki)
├── components/             # Komponenty wielokrotnego użytku
├── constants/              # Stałe i konfiguracja
├── hooks/                  # Custom hooks
├── types/                 # Definicje TypeScript
└── utils/                 # Funkcje pomocnicze
```

