import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAlarms } from '@/hooks/useAlarmStore';
import { Alarm, WeekDay } from '@/types/alarm';
import Colors from '@/constants/colors';
import TimePickerModal from '@/components/TimePickerModal';
import DatePickerModal from '@/components/DatePickerModal';
import DaySelector from '@/components/DaySelector';
import ToneSelector from '@/components/ToneSelector';
import { formatTime, getCurrentTime } from '@/utils/dateUtils';

/**
 * Ekran tworzenia nowego alarmu.
 * Umożliwia użytkownikowi skonfigurowanie wszystkich opcji nowego alarmu i jego zapisanie.
 */
export default function NewAlarmScreen() {
  const { addAlarm } = useAlarms(); // Funkcja do dodawania alarmu z hooka
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  
  // Stan przechowujący konfigurację nowego alarmu
  const [alarm, setAlarm] = useState<Omit<Alarm, 'id'>>({
    time: getCurrentTime(),
    enabled: true,
    label: '',
    days: [],
    tone: 'default',
    snoozeEnabled: true,
    snoozeDuration: 5,
    mathChallengeEnabled: false,
    mathChallengeDifficulty: 'easy',
    specificDate: undefined,
  });

  // Funkcja zapisująca nowy alarm i zamykająca modal
  const handleSave = () => {
    addAlarm(alarm);
    router.back();
  };

  // Aktualizacja czasu w stanie alarmu
  const handleTimeChange = (newTime: string) => {
    setAlarm({ ...alarm, time: newTime });
  };

  // Aktualizacja konkretnej daty w stanie alarmu
  const handleDateChange = (date: Date | undefined) => {
    setAlarm({ ...alarm, specificDate: date });
  };

  // Przełączanie wybranych dni tygodnia
  const handleDayToggle = (day: WeekDay) => {
    const newDays = [...alarm.days];
    const dayIndex = newDays.indexOf(day);
    
    if (dayIndex >= 0) {
      newDays.splice(dayIndex, 1); // Usuń dzień, jeśli już jest zaznaczony
    } else {
      newDays.push(day); // Dodaj dzień, jeśli nie jest zaznaczony
    }
    
    setAlarm({ ...alarm, days: newDays });
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync(); // Wibracja przy wyborze
    }
  };

  // Przełączanie ustawień typu on/off (np. drzemka, wyzwanie matematyczne)
  const toggleSetting = (setting: keyof Omit<Alarm, 'id'>, value?: boolean) => {
    if (setting === 'enabled' || setting === 'snoozeEnabled' || setting === 'mathChallengeEnabled') {
      const newValue = value !== undefined ? value : !alarm[setting];
      setAlarm({ ...alarm, [setting]: newValue });
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New Alarm' }} />
      
      <ScrollView style={styles.container}>
        {/* Sekcja wyboru czasu */}
        <View style={styles.timeSection}>
          <TouchableOpacity
            style={styles.timeDisplay}
            onPress={() => setTimePickerVisible(true)}
            testID="time-picker-button"
          >
            <Text style={styles.timeText}>{formatTime(alarm.time)}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Sekcja wyboru konkretnej daty */}
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
        
        {/* Sekcja wyboru dni tygodnia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Repeat</Text>
          <DaySelector
            selectedDays={alarm.days}
            onDayToggle={handleDayToggle}
          />
        </View>
        
        {/* Sekcja etykiety alarmu */}
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
        
        {/* Sekcja wyboru dźwięku */}
        <View style={styles.section}>
          <ToneSelector
            selectedToneId={alarm.tone}
            onToneSelect={(toneId) => setAlarm({ ...alarm, tone: toneId })}
          />
        </View>
        
        {/* Sekcja ustawień dodatkowych */}
        <View style={styles.section}>
          {/* Włącz/Wyłącz alarm */}
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
          
          {/* Włącz/Wyłącz drzemkę */}
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
          
          {/* Włącz/Wyłącz wyzwanie matematyczne */}
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
          
          {/* Wybór poziomu trudności wyzwania (jeśli włączone) */}
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
        
        {/* Przycisk zapisu */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          testID="save-alarm-button"
        >
          <Text style={styles.saveButtonText}>Save Alarm</Text>
        </TouchableOpacity>
        
        {/* Modale do wyboru czasu i daty */}
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
    fontWeight: '300' as const,
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
    fontWeight: '600' as const,
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
