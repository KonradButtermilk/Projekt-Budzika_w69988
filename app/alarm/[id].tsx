import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Trash2, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAlarms } from '@/hooks/useAlarmStore';
import { Alarm, WeekDay } from '@/types/alarm';
import Colors from '@/constants/colors';
import TimePickerModal from '@/components/TimePickerModal';
import DatePickerModal from '@/components/DatePickerModal';
import DaySelector from '@/components/DaySelector';
import ToneSelector from '@/components/ToneSelector';
import { formatTime } from '@/utils/dateUtils';

/**
 * Ekran edycji istniejącego alarmu.
 * Umożliwia modyfikację wszystkich opcji wybranego alarmu oraz jego usunięcie.
 */
export default function AlarmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // Pobranie ID alarmu z parametrów nawigacji
  const { alarms, updateAlarm, deleteAlarm } = useAlarms();
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ustawienie flagi, że komponent jest zamontowany, aby uniknąć wycieków pamięci
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Wyszukanie alarmu po ID, gdy komponent jest gotowy
  useEffect(() => {
    if (id && isMounted) {
      const foundAlarm = alarms.find(a => a.id === id);
      if (foundAlarm) {
        setAlarm(foundAlarm);
      } else {
        // Jeśli alarm nie zostanie znaleziony, wróć do poprzedniego ekranu
        if (isMounted) {
          router.back();
        }
      }
    }
  }, [id, alarms, isMounted]);

  // Zapisuje zmiany w alarmie
  const handleSave = () => {
    if (alarm && isMounted) {
      updateAlarm(alarm);
      router.back();
    }
  };

  // Usuwa alarm po potwierdzeniu
  const handleDelete = () => {
    if (!id || !isMounted) return;
    
    // Użyj natywnego `confirm` dla web
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this alarm?');
      if (confirmed) {
        deleteAlarm(id);
        router.back();
      }
    } else {
      // Użyj `Alert.alert` dla mobile
      Alert.alert(
        'Delete Alarm',
        'Are you sure you want to delete this alarm?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            onPress: () => {
              if (isMounted) {
                deleteAlarm(id);
                router.back();
              }
            },
            style: 'destructive',
          },
        ]
      );
    }
  };

  // Aktualizuje czas w stanie lokalnym
  const handleTimeChange = (newTime: string) => {
    if (alarm) {
      setAlarm({ ...alarm, time: newTime });
    }
  };

  // Aktualizuje datę w stanie lokalnym
  const handleDateChange = (date: Date | undefined) => {
    if (alarm) {
      setAlarm({ ...alarm, specificDate: date });
    }
  };

  // Przełącza wybrany dzień tygodnia
  const handleDayToggle = (day: WeekDay) => {
    if (!alarm) return;
    const newDays = [...alarm.days];
    const dayIndex = newDays.indexOf(day);
    
    if (dayIndex >= 0) {
      newDays.splice(dayIndex, 1);
    } else {
      newDays.push(day);
    }
    
    setAlarm({ ...alarm, days: newDays });
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  // Przełącza ustawienia (włączony, drzemka, wyzwanie mat.)
  const toggleSetting = (setting: keyof Alarm, value?: boolean) => {
    if (!alarm) return;
    if (setting === 'enabled' || setting === 'snoozeEnabled' || setting === 'mathChallengeEnabled') {
      const newValue = value !== undefined ? value : !alarm[setting];
      setAlarm({ ...alarm, [setting]: newValue });
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
    }
  };

  // Nie renderuj nic, dopóki alarm się nie załaduje
  if (!alarm || !isMounted) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Alarm',
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Trash2 color={Colors.light.danger} size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.container}>
        {/* Sekcje formularza edycji - analogiczne do ekranu tworzenia nowego alarmu */}
        <View style={styles.timeSection}>
          <TouchableOpacity
            style={styles.timeDisplay}
            onPress={() => setTimePickerVisible(true)}
            testID="time-picker-button"
          >
            <Text style={styles.timeText}>{formatTime(alarm.time)}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Specific Date (Optional)</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setDatePickerVisible(true)}
              testID="date-picker-button"
            >
              <Calendar size={20} color={Colors.light.primary} />
              <Text style={styles.dateButtonText}>
                {alarm.specificDate 
                  ? alarm.specificDate.toLocaleDateString()
                  : 'Select Date'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Repeat</Text>
          <DaySelector
            selectedDays={alarm.days}
            onDayToggle={handleDayToggle}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Label</Text>
          <TextInput
            style={styles.input}
            value={alarm.label}
            onChangeText={(text) => setAlarm({ ...alarm, label: text })}
            placeholder="Alarm label (optional)"
            maxLength={30}
            testID="alarm-label-input"
          />
        </View>
        
        <View style={styles.section}>
          <ToneSelector
            selectedToneId={alarm.tone}
            onToneSelect={(toneId) => setAlarm({ ...alarm, tone: toneId })}
          />
        </View>
        
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Enabled</Text>
            <Switch
              value={alarm.enabled}
              onValueChange={() => toggleSetting('enabled')}
              trackColor={{ false: Colors.light.gray[300], true: Colors.light.primary }}
              thumbColor="white"
              testID="alarm-enabled-switch"
            />
          </View>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingText}>Snooze</Text>
              {alarm.snoozeEnabled && (
                <Text style={styles.settingSubtext}>
                  {alarm.snoozeDuration} minutes
                </Text>
              )}
            </View>
            <Switch
              value={alarm.snoozeEnabled}
              onValueChange={() => toggleSetting('snoozeEnabled')}
              trackColor={{ false: Colors.light.gray[300], true: Colors.light.primary }}
              thumbColor="white"
              testID="snooze-enabled-switch"
            />
          </View>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingText}>Math Challenge</Text>
              <Text style={styles.settingSubtext}>
                Solve math problem to dismiss
              </Text>
            </View>
            <Switch
              value={alarm.mathChallengeEnabled}
              onValueChange={() => toggleSetting('mathChallengeEnabled')}
              trackColor={{ false: Colors.light.gray[300], true: Colors.light.primary }}
              thumbColor="white"
              testID="math-challenge-switch"
            />
          </View>
          
          {alarm.mathChallengeEnabled && (
            <View style={styles.difficultyContainer}>
              <Text style={styles.difficultyLabel}>Difficulty</Text>
              <View style={styles.difficultyButtons}>
                {['easy', 'medium', 'hard'].map((difficulty) => (
                  <TouchableOpacity
                    key={difficulty}
                    style={[
                      styles.difficultyButton,
                      alarm.mathChallengeDifficulty === difficulty && styles.selectedDifficulty
                    ]}
                    onPress={() => setAlarm({ ...alarm, mathChallengeDifficulty: difficulty as 'easy' | 'medium' | 'hard' })}
                    testID={`difficulty-${difficulty}`}
                  >
                    <Text
                      style={[
                        styles.difficultyButtonText,
                        alarm.mathChallengeDifficulty === difficulty && styles.selectedDifficultyText
                      ]}
                    >
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          testID="save-alarm-button"
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
        
        <TimePickerModal
          visible={timePickerVisible}
          initialTime={alarm.time}
          onClose={() => setTimePickerVisible(false)}
          onSave={handleTimeChange}
        />
        
        <DatePickerModal
          visible={datePickerVisible}
          initialDate={alarm.specificDate}
          onClose={() => setDatePickerVisible(false)}
          onSave={handleDateChange}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  deleteButton: {
    marginRight: 16,
  },
  timeSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray[200],
  },
  timeDisplay: {
    padding: 16,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '300',
    color: Colors.light.primary,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray[200],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.light.text,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.gray[100],
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.light.primary,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.light.gray[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: Colors.light.gray[100],
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  settingSubtext: {
    fontSize: 14,
    color: Colors.light.gray[600],
    marginTop: 2,
  },
  difficultyContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  difficultyLabel: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 8,
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.gray[300],
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedDifficulty: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  difficultyButtonText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  selectedDifficultyText: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
