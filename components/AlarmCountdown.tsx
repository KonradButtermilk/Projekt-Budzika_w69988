import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Alarm } from '@/types/alarm';
import { getNextAlarmTime } from '@/utils/dateUtils';

interface AlarmCountdownProps {
  alarm: Alarm;
}

/**
 * Komponent wyświetlający czas pozostały do następnego dzwonka alarmu.
 * Aktualizuje się co minutę.
 */
export default function AlarmCountdown({ alarm }: AlarmCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    // Jeśli alarm jest wyłączony, nie pokazuj odliczania
    if (!alarm.enabled) {
      setTimeRemaining('');
      return;
    }

    const updateCountdown = () => {
      // Pobierz czas następnego dzwonka
      const nextAlarmTime = getNextAlarmTime(alarm);
      
      if (!nextAlarmTime) {
        setTimeRemaining('');
        return;
      }

      const now = new Date();
      const diff = nextAlarmTime.getTime() - now.getTime();

      // Jeśli czas już minął, nie pokazuj odliczania
      if (diff <= 0) {
        setTimeRemaining('');
        return;
      }

      // Oblicz dni, godziny i minuty
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      // Sformatuj pozostały czas do wyświetlenia
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateCountdown();
    // Ustaw interwał do aktualizacji co minutę
    const interval = setInterval(updateCountdown, 60000);

    // Wyczyść interwał przy odmontowywaniu komponentu
    return () => clearInterval(interval);
  }, [alarm]);

  // Nie renderuj nic, jeśli nie ma pozostałego czasu lub alarm jest wyłączony
  if (!timeRemaining || !alarm.enabled) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Clock size={14} color={Colors.light.primary} />
      <Text style={styles.countdownText}>{timeRemaining}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '20', // Lekko przezroczyste tło
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  countdownText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
});
