import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import { WeekDay } from '@/types/alarm';
import { getWeekDayShortName, getAllWeekDays } from '@/utils/dateUtils';

interface DaySelectorProps {
  selectedDays: WeekDay[];
  onDayToggle: (day: WeekDay) => void;
}

/**
 * Komponent do wyboru dni tygodnia.
 * Wyświetla przyciski dla każdego dnia tygodnia, umożliwiając ich zaznaczanie i odznaczanie.
 */
export default function DaySelector({ selectedDays, onDayToggle }: DaySelectorProps) {
  // Pobranie listy wszystkich dni tygodnia
  const allDays = getAllWeekDays();

  return (
    <View style={styles.container}>
      {allDays.map((day) => (
        <TouchableOpacity
          key={day}
          style={[
            styles.dayButton,
            // Zastosuj styl `selectedDayButton` jeśli dzień jest zaznaczony
            selectedDays.includes(day) && styles.selectedDayButton
          ]}
          onPress={() => onDayToggle(day)}
          testID={`day-selector-${day}`}
        >
          <Text
            style={[
              styles.dayText,
              // Zastosuj styl `selectedDayText` jeśli dzień jest zaznaczony
              selectedDays.includes(day) && styles.selectedDayText
            ]}
          >
            {getWeekDayShortName(day)} 
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20, // Okrągłe przyciski
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.gray[100],
  },
  selectedDayButton: {
    backgroundColor: Colors.light.primary, // Kolor dla zaznaczonego dnia
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.gray[700],
  },
  selectedDayText: {
    color: 'white', // Kolor tekstu dla zaznaczonego dnia
  },
});