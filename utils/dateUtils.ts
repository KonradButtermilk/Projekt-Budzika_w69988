import { WeekDay } from '@/types/alarm';

/**
 * Formatuje czas z formatu "HH:MM" na "h:mm A/PM".
 * @param time - Czas w formacie "HH:MM" (np. "13:05").
 * @returns Sformatowany czas (np. "1:05 PM").
 */
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  const formattedMinute = minute.toString().padStart(2, '0');
  
  return `${formattedHour}:${formattedMinute} ${period}`;
};

/**
 * Zwraca aktualny czas w formacie "HH:MM".
 * @returns Aktualny czas jako string.
 */
export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Zwraca nazwę dnia tygodnia dla podanej daty.
 * @param date - Obiekt Date (domyślnie aktualna data).
 * @returns Nazwa dnia tygodnia (np. "sunday", "monday").
 */
export const getDayOfWeek = (date: Date = new Date()): WeekDay => {
  const days: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

/**
 * Zwraca pełną nazwę dnia tygodnia.
 * @param day - Dzień tygodnia (np. "monday").
 * @returns Pełna nazwa dnia (np. "Monday").
 */
export const getWeekDayName = (day: WeekDay): string => {
  const names: Record<WeekDay, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };
  return names[day];
};

/**
 * Zwraca skróconą nazwę dnia tygodnia.
 * @param day - Dzień tygodnia (np. "monday").
 * @returns Skrócona nazwa dnia (np. "Mon").
 */
export const getWeekDayShortName = (day: WeekDay): string => {
  const names: Record<WeekDay, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  };
  return names[day];
};

/**
 * Zwraca tablicę wszystkich dni tygodnia.
 * @returns Tablica WeekDay.
 */
export const getAllWeekDays = (): WeekDay[] => {
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
};

/**
 * Zwraca tablicę dni roboczych.
 * @returns Tablica WeekDay.
 */
export const getWeekdayDays = (): WeekDay[] => {
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
};

/**
 * Zwraca tablicę dni weekendowych.
 * @returns Tablica WeekDay.
 */
export const getWeekendDays = (): WeekDay[] => {
  return ['saturday', 'sunday'];
};

/**
 * Oblicza następny czas dzwonka dla alarmu.
 * Uwzględnia dni tygodnia i opcjonalną konkretną datę.
 * @param alarm - Obiekt alarmu zawierający czas, dni i opcjonalną datę.
 * @returns Obiekt Date reprezentujący następny czas dzwonka lub null, jeśli alarm nie ma przyszłych wystąpień.
 */
export const getNextAlarmTime = (alarm: { time: string; days: WeekDay[]; specificDate?: Date }): Date | null => {
  const now = new Date();
  const [hours, minutes] = alarm.time.split(':').map(Number);
  
  // Jeśli ustawiona jest konkretna data, użyj jej
  if (alarm.specificDate) {
    const alarmDate = new Date(alarm.specificDate);
    alarmDate.setHours(hours, minutes, 0, 0);
    
    // Zwróć tylko, jeśli czas alarmu jest w przyszłości
    if (alarmDate > now) {
      return alarmDate;
    }
    return null;
  }
  
  // Jeśli nie wybrano dni, alarm powinien zadzwonić raz (następne wystąpienie o tej godzinie)
  if (alarm.days.length === 0) {
    const nextAlarmDate = new Date();
    nextAlarmDate.setHours(hours, minutes, 0, 0);
    
    // Jeśli czas minął dzisiaj, ustaw na jutro
    if (nextAlarmDate <= now) {
      nextAlarmDate.setDate(nextAlarmDate.getDate() + 1);
    }
    
    return nextAlarmDate;
  }
  
  const currentDay = getDayOfWeek();
  const allWeekDays = getAllWeekDays();
  const currentDayIndex = allWeekDays.indexOf(currentDay);
  const alarmDayIndices = alarm.days.map(day => allWeekDays.indexOf(day));
  
  // Sortuj indeksy dni, aby znaleźć następne wystąpienie
  alarmDayIndices.sort((a, b) => {
    const adjustedA = a < currentDayIndex ? a + 7 : a;
    const adjustedB = b < currentDayIndex ? b + 7 : b;
    return adjustedA - adjustedB;
  });
  
  // Znajdź następny dzień, w którym jest alarm
  let nextDayIndex = alarmDayIndices.find(dayIndex => {
    if (dayIndex === currentDayIndex) {
      // Jeśli to ten sam dzień, sprawdź, czy czas już minął
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      return (hours > currentHours) || (hours === currentHours && minutes > currentMinutes);
    }
    return dayIndex > currentDayIndex;
  });
  
  // Jeśli nie znaleziono dnia w bieżącym tygodniu, weź pierwszy dzień następnego tygodnia
  if (nextDayIndex === undefined) {
    nextDayIndex = alarmDayIndices[0] + 7;
  }
  
  // Oblicz różnicę dni
  const daysToAdd = (nextDayIndex < currentDayIndex) 
    ? 7 - (currentDayIndex - nextDayIndex) 
    : nextDayIndex - currentDayIndex;
  
  // Utwórz obiekt Date dla następnego dzwonka alarmu
  const nextAlarmDate = new Date();
  nextAlarmDate.setDate(now.getDate() + daysToAdd);
  nextAlarmDate.setHours(hours, minutes, 0, 0);
  
  return nextAlarmDate;
};
