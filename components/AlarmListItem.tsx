import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Alarm, WeekDay } from '@/types/alarm';
import { formatTime, getWeekDayShortName } from '@/utils/dateUtils';
import AlarmCountdown from './AlarmCountdown';

interface AlarmListItemProps {
  alarm: Alarm;
  onPress: (alarm: Alarm) => void; // Funkcja wywoływana po naciśnięciu elementu
  onToggle: (id: string) => void;   // Funkcja wywoływana po przełączeniu przełącznika
}

/**
 * Komponent reprezentujący pojedynczy alarm na liście alarmów.
 * Wyświetla kluczowe informacje o alarmie i umożliwia interakcję (włączanie/wyłączanie, edycja).
 */
export default function AlarmListItem({ alarm, onPress, onToggle }: AlarmListItemProps) {
  // Obsługa przełącznika włącz/wyłącz
  const handleToggle = (value: boolean) => {
    onToggle(alarm.id);
  };

  // Obsługa naciśnięcia na element listy (prowadzi do edycji)
  const handlePress = () => {
    onPress(alarm);
  };

  // Renderuje skrócony opis dni, w które alarm się powtarza
  const renderDays = () => {
    if (alarm.days.length === 7) {
      return 'Every day';
    } else if (alarm.days.length === 0) {
      return 'Once'; // Alarm jednorazowy
    } else if (JSON.stringify(alarm.days.sort()) === JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].sort())) {
      return 'Weekdays';
    } else if (JSON.stringify(alarm.days.sort()) === JSON.stringify(['saturday', 'sunday'].sort())) {
      return 'Weekends';
    } else {
      // Wyświetla skróty nazw dni (np. Mon, Tue)
      return alarm.days.map(day => getWeekDayShortName(day as WeekDay)).join(', ');
    }
  };

  return (
    // Zastosuj styl `disabledContainer` jeśli alarm jest wyłączony
    <View style={[styles.container, !alarm.enabled && styles.disabledContainer]}>
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        testID={`alarm-item-${alarm.id}`}
      >
        {/* Wyświetlanie godziny alarmu */}
        <Text style={[styles.time, !alarm.enabled && styles.disabledText]}>
          {formatTime(alarm.time)}
        </Text>
        
        <View style={styles.detailsContainer}>
          {/* Wyświetlanie etykiety (jeśli istnieje) */}
          {alarm.label && (
            <Text style={[styles.label, !alarm.enabled && styles.disabledText]}>
              {alarm.label}
            </Text>
          )}
          
          {/* Wyświetlanie dni powtórzeń */}
          <Text style={[styles.days, !alarm.enabled && styles.disabledText]}>
            {renderDays()}
          </Text>
          
          {/* Komponent odliczający czas do alarmu */}
          <AlarmCountdown alarm={alarm} />
          
          {/* Znaczek informujący o włączonym wyzwaniu matematycznym */}
          {alarm.mathChallengeEnabled && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Math</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.controls}>
        {/* Przełącznik do włączania/wyłączania alarmu */}
        <Switch
          value={alarm.enabled}
          onValueChange={handleToggle}
          trackColor={{ false: Colors.light.gray[300], true: Colors.light.primary }}
          thumbColor="white"
          testID={`alarm-toggle-${alarm.id}`}
        />
        {/* Ikona strzałki, która również prowadzi do edycji */}
        <TouchableOpacity onPress={handlePress} style={styles.chevronButton}>
          <ChevronRight size={20} color={Colors.light.gray[500]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  disabledContainer: {
    opacity: 0.7, // Zmniejszona przezroczystość dla wyłączonych alarmów
  },
  content: {
    flex: 1,
  },
  time: {
    fontSize: 32,
    fontWeight: '300',
    color: Colors.light.text,
    marginBottom: 4,
  },
  disabledText: {
    color: Colors.light.gray[500], // Szary kolor tekstu dla wyłączonych alarmów
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: Colors.light.text,
    marginRight: 8,
  },
  days: {
    fontSize: 16,
    color: Colors.light.gray[600],
  },
  badge: {
    backgroundColor: Colors.light.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevronButton: {
    marginLeft: 12,
    padding: 4,
  },
});
