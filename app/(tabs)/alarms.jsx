import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AlarmService from '@/services/AlarmService';
import NotificationService from '@/services/NotificationService';
import AddAlarmModal from '@/components/AddAlarmModal';
import AlarmItem from '@/components/AlarmItem';

/**
 * Ekran główny budzika. Wyświetla listę alarmów, umożliwia dodawanie, edycję i usuwanie alarmów.
 */
export default function AlarmsScreen() {
  // Stan przechowujący listę alarmów.
  const [alarms, setAlarms] = useState([]);
  // Stan kontrolujący widoczność modalu dodawania/edycji alarmu.
  const [modalVisible, setModalVisible] = useState(false);
  // Stan przechowujący alarm, który jest aktualnie edytowany (null, jeśli dodawany jest nowy alarm).
  const [editingAlarm, setEditingAlarm] = useState(null);

  /**
   * Funkcja ładująca alarmy z pamięci urządzenia.
   * Używa `useCallback` do optymalizacji i `useFocusEffect` do ładowania alarmów za każdym razem, gdy ekran jest aktywny.
   */
  const loadAlarms = useCallback(async () => {
    const loadedAlarms = await AlarmService.getAlarms();
    setAlarms(loadedAlarms);
  }, []);

  // Ładowanie alarmów przy pierwszym renderowaniu i za każdym razem, gdy ekran jest ponownie fokusowany.
  useFocusEffect(
    useCallback(() => {
      loadAlarms();
      // Prośba o uprawnienia do powiadomień przy każdym wejściu na ekran alarmów.
      NotificationService.requestPermissions();
      return () => {
        // Opcjonalnie: można anulować subskrypcje lub wyczyścić coś, gdy ekran traci focus.
      };
    }, [loadAlarms])
  );

  /**
   * Obsługuje dodawanie lub edycję alarmu.
   * @param {object} alarm - Obiekt alarmu do zapisania.
   */
  const handleSaveAlarm = async (alarm) => {
    await AlarmService.saveAlarm(alarm);
    loadAlarms(); // Odśwież listę alarmów po zapisaniu.
    setModalVisible(false); // Ukryj modal.
    setEditingAlarm(null); // Wyczyść edytowany alarm.
  };

  /**
   * Obsługuje usunięcie alarmu.
   * @param {string} id - ID alarmu do usunięcia.
   */
  const handleDeleteAlarm = async (id) => {
    Alert.alert(
      'Usuń alarm',
      'Czy na pewno chcesz usunąć ten alarm?',
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Usuń', onPress: async () => {
            await AlarmService.deleteAlarm(id);
            loadAlarms(); // Odśwież listę alarmów po usunięciu.
          }
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Obsługuje przełączanie stanu aktywacji alarmu (włącz/wyłącz).
   * @param {string} id - ID alarmu do przełączenia.
   * @param {boolean} isEnabled - Nowy stan aktywacji alarmu.
   */
  const handleToggleAlarm = async (id, isEnabled) => {
    await AlarmService.toggleAlarm(id, isEnabled);
    loadAlarms(); // Odśwież listę alarmów po zmianie stanu.
  };

  /**
   * Obsługuje rozpoczęcie edycji istniejącego alarmu.
   * @param {object} alarm - Obiekt alarmu do edycji.
   */
  const handleEditAlarm = (alarm) => {
    setEditingAlarm(alarm);
    setModalVisible(true);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Nagłówek ekranu */}
      <ThemedText type="title" style={styles.title}>Twoje Alarmy</ThemedText>

      {/* Lista alarmów */}
      {alarms.length === 0 ? (
        <ThemedText style={styles.noAlarmsText}>Brak ustawionych alarmów. Dodaj nowy!</ThemedText>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlarmItem
              alarm={item}
              onDelete={handleDeleteAlarm}
              onToggle={handleToggleAlarm}
              onEdit={handleEditAlarm}
            />
          )}
          style={styles.alarmList}
        />
      )}

      {/* Przycisk dodawania nowego alarmu */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingAlarm(null); // Ustaw na null, aby dodać nowy alarm.
          setModalVisible(true); // Pokaż modal.
        }}
      >
        <IconSymbol name="plus.circle.fill" size={40} color="white" />
      </TouchableOpacity>

      {/* Modal dodawania/edycji alarmu */}
      <AddAlarmModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingAlarm(null);
        }}
        onSave={handleSaveAlarm}
        initialAlarm={editingAlarm}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    position: 'relative', // Potrzebne do pozycjonowania przycisku dodawania
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  noAlarmsText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: 'gray',
  },
  alarmList: {
    flexGrow: 1,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#0a7ea4', // Kolor przycisku
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Cień dla Androida
    shadowColor: '#000', // Cień dla iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
