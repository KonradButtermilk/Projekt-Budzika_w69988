import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useAlarms } from '@/hooks/useAlarmStore';
import Colors from '@/constants/colors';
import MathChallenge from '@/components/MathChallenge';
import { formatTime } from '@/utils/dateUtils';
import { getAlarmToneById } from '@/constants/alarmTones';

/**
 * Ekran aktywnego alarmu.
 * Wyświetlany, gdy alarm dzwoni. Umożliwia drzemkę lub wyłączenie alarmu.
 * Jeśli włączone jest wyzwanie matematyczne, użytkownik musi je rozwiązać, aby wyłączyć alarm.
 */
export default function ActiveAlarmScreen() {
  const { activeAlarm, snoozeAlarm, dismissAlarm, dismissAlarmAfterMath } = useAlarms();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [showMathChallenge, setShowMathChallenge] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ustawienie flagi, że komponent jest zamontowany
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Przekierowanie na ekran główny, jeśli nie ma aktywnego alarmu
  useEffect(() => {
    if (!activeAlarm && isMounted) {
      router.replace('/');
    }
  }, [activeAlarm, isMounted]);

  // Odtwarzanie dźwięku alarmu
  useEffect(() => {
    let isCancelled = false; 
    
    if (activeAlarm && !activeAlarm.isSnoozing) {
      const playAlarmSound = async () => {
        try {
          if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
            if (!isCancelled) setSound(null);
          }
          
          if (!isCancelled) {
            const tone = await getAlarmToneById(activeAlarm.tone);
            const { sound: newSound } = await Audio.Sound.createAsync(
              { uri: tone.url },
              { shouldPlay: true, isLooping: true } 
            );
            if (!isCancelled) setSound(newSound);
          }
          
          if (Platform.OS !== 'web' && !isCancelled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        } catch (error) {
          console.error('Failed to play alarm sound:', error);
        }
      };
      playAlarmSound();
    }
    
    return () => {
      isCancelled = true;
      if (sound) {
        sound.unloadAsync();
        setSound(null);
      }
    };
  }, [activeAlarm]); 

  // Funkcja do zatrzymywania dźwięku alarmu
  const stopAlarmSound = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      } catch (error) {
        console.log('Error stopping sound:', error);
      }
    }
  };

  // Obsługa naciśnięcia przycisku "Dismiss" (Wyłącz)
  const handleDismiss = async () => {
    if (activeAlarm?.mathChallengeEnabled && !showMathChallenge) {
      setShowMathChallenge(true);
      return;
    }
    
    await stopAlarmSound(); // Czekaj na zatrzymanie dźwięku
    if (isMounted) {
      dismissAlarm();
    }
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Obsługa naciśnięcia przycisku "Snooze" (Drzemka)
  const handleSnooze = async () => {
    await stopAlarmSound(); // Czekaj na zatrzymanie dźwięku
    if (isMounted) {
      snoozeAlarm();
    }
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  // Obsługa poprawnego rozwiązania wyzwania matematycznego
  const handleMathChallengeSolved = async () => {
    if (!isMounted) return;
    
    await stopAlarmSound(); // Czekaj na zatrzymanie dźwięku
    
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    dismissAlarmAfterMath(); // To spowoduje nawigację do głównego ekranu
  };

  if (!activeAlarm || !isMounted) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.container}>
        {showMathChallenge ? (
          <MathChallenge
            difficulty={activeAlarm.mathChallengeDifficulty}
            onSolved={handleMathChallengeSolved}
          />
        ) : (
          <>
            <View style={styles.alarmInfo}>
              <Text style={styles.time}>{formatTime(activeAlarm.time)}</Text>
              
              {activeAlarm.label && (
                <Text style={styles.label}>{activeAlarm.label}</Text>
              )}
              
              {activeAlarm.isSnoozing && (
                <View style={styles.snoozeBadge}>
                  <Text style={styles.snoozeText}>
                    Snoozed ({activeAlarm.snoozeCount})
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.buttonContainer}>
              {activeAlarm.snoozeEnabled && !activeAlarm.isSnoozing && (
                <TouchableOpacity
                  style={[styles.button, styles.snoozeButton]}
                  onPress={handleSnooze}
                  testID="snooze-button"
                >
                  <Text style={styles.snoozeButtonText}>
                    Snooze for {activeAlarm.snoozeDuration} min
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.button, styles.dismissButton]}
                onPress={handleDismiss}
                testID="dismiss-button"
              >
                <Text style={styles.dismissButtonText}>
                  {activeAlarm.mathChallengeEnabled ? 'Solve to Dismiss' : 'Dismiss'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    padding: 20,
  },
  alarmInfo: {
    alignItems: 'center',
    marginBottom: 60,
  },
  time: {
    fontSize: 64,
    fontWeight: '200',
    color: 'white',
    marginBottom: 16,
  },
  label: {
    fontSize: 24,
    color: 'white',
    marginBottom: 16,
  },
  snoozeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  snoozeText: {
    color: 'white',
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  snoozeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  snoozeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  dismissButton: {
    backgroundColor: 'white',
  },
  dismissButtonText: {
    color: Colors.light.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});
