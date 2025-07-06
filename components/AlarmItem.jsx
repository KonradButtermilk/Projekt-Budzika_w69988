import React from 'react';
import { View, StyleSheet, Switch, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Komponent AlarmItem wyświetla pojedynczy alarm na liście.
 * Umożliwia włączanie/wyłączanie, edycję i usuwanie alarmu.
 */
export default function AlarmItem({ alarm, onToggle, onEdit, onDelete }) {
  const colorScheme = useColorScheme();
  const isLight = colorScheme === 'light';

  return (
    <ThemedView style={styles.alarmContainer}>
      {/* Sekcja czasu i etykiety alarmu */}
      <View style={styles.alarmInfo}>
        <ThemedText type="title" style={styles.timeText}>
          {alarm.time}
        </ThemedText>
        {alarm.label && (
          <ThemedText type="defaultSemiBold" style={styles.labelText}>
            {alarm.label}
          </ThemedText>
        )}
      </View>

      {/* Przełącznik włączania/wyłączania alarmu */}
      <Switch
        trackColor={{ false: isLight ? Colors.light.tabIconDefault : Colors.dark.tabIconDefault, true: Colors[colorScheme].tint }}
        thumbColor={isLight ? Colors.light.background : Colors.dark.background}
        ios_backgroundColor={isLight ? Colors.light.tabIconDefault : Colors.dark.tabIconDefault}
        onValueChange={(value) => onToggle(alarm.id, value)}
        value={alarm.isEnabled}
        style={styles.switch}
      />

      {/* Przyciski akcji (edytuj, usuń) */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={() => onEdit(alarm)} style={styles.actionButton}>
          <IconSymbol name="pencil" size={20} color={isLight ? Colors.light.icon : Colors.dark.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(alarm.id)} style={styles.actionButton}>
          <IconSymbol name="trash" size={20} color={isLight ? Colors.light.icon : Colors.dark.icon} />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  alarmContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    // Cienie i elewacja dla lepszego wyglądu
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alarmInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  labelText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 5,
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }], // Powiększenie przełącznika
    marginHorizontal: 15,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 5,
  },
});
