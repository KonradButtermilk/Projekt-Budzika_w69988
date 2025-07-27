import React, { useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useSortedAlarms, useAlarms } from '@/hooks/useAlarmStore';
import AlarmListItem from '@/components/AlarmListItem';
import Colors from '@/constants/colors';

/**
 * Główny ekran aplikacji wyświetlający listę alarmów.
 * Umożliwia dodawanie nowych alarmów i nawigację do edycji istniejących.
 */
export default function AlarmsScreen() {
  // Pobranie funkcji do przełączania stanu alarmu (włączony/wyłączony)
  const { toggleAlarmEnabled } = useAlarms();
  // Pobranie posortowanej listy alarmów
  const alarms = useSortedAlarms();

  // Funkcja nawigująca do ekranu tworzenia nowego alarmu
  const handleAddAlarm = useCallback(() => {
    router.push('/alarm/new');
  }, []);

  // Funkcja nawigująca do ekranu edycji wybranego alarmu
  const handleAlarmPress = useCallback((id: string) => {
    router.push(`/alarm/${id}`);
  }, []);

  // Komponent renderowany, gdy lista alarmów jest pusta
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Alarms</Text>
      <Text style={styles.emptyText}>
        Tap the + button to create your first alarm
      </Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddAlarm}
        testID="empty-add-alarm-button"
      >
        <Plus color="white" size={24} />
        <Text style={styles.addButtonText}>Add Alarm</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Warunkowe renderowanie: jeśli brak alarmów, pokaż stan pusty, w przeciwnym razie listę */}
      {alarms.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlarmListItem
              alarm={item}
              onPress={() => handleAlarmPress(item.id)}
              onToggle={toggleAlarmEnabled}
            />
          )}
          contentContainerStyle={styles.listContent}
          testID="alarms-list"
        />
      )}
      
      {/* Pływający przycisk do dodawania nowego alarmu */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={handleAddAlarm}
        testID="floating-add-button"
      >
        <Plus color="white" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    paddingBottom: 80, // Zapewnia, że pływający przycisk nie zasłania ostatniego elementu
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.light.text,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: Colors.light.gray[600],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
    elevation: 5,
  },
});
