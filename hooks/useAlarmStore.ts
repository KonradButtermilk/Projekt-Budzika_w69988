import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import createContextHook from '@nkzw/create-context-hook';
import { Alarm, ActiveAlarm, WeekDay } from '@/types/alarm';
import { getCurrentTime, getDayOfWeek } from '@/utils/dateUtils';

const STORAGE_KEY = 'alarm_clock_alarms';

/**
 * Tworzy kontekst i hook do zarządzania stanem alarmów w całej aplikacji.
 * Używa @tanstack/react-query do operacji asynchronicznych i cachowania,
 * oraz AsyncStorage do trwałego przechowywania danych.
 */
export const [AlarmProvider, useAlarms] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(null);

  // Zapytanie do pobrania alarmów z AsyncStorage
  const alarmsQuery = useQuery({
    queryKey: ['alarms'],
    queryFn: async () => {
      try {
        const storedAlarms = await AsyncStorage.getItem(STORAGE_KEY);
        const alarms = storedAlarms ? JSON.parse(storedAlarms) as Alarm[] : [];
        // Konwertuje stringi dat z powrotem na obiekty Date
        return alarms.map(alarm => ({
          ...alarm,
          specificDate: alarm.specificDate ? new Date(alarm.specificDate) : undefined
        }));
      } catch (error) {
        console.error('Failed to load alarms:', error);
        return [];
      }
    }
  });

  // Mutacja do zapisywania alarmów w AsyncStorage
  const saveAlarmsMutation = useMutation({
    mutationFn: async (alarms: Alarm[]) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
        return alarms;
      } catch (error) {
        console.error('Failed to save alarms:', error);
        throw error;
      }
    },
    // Po sukcesie, aktualizuje dane w cache react-query
    onSuccess: (alarms) => {
      queryClient.setQueryData(['alarms'], alarms);
    }
  });

  // Dodaje nowy alarm
  const addAlarm = (alarm: Omit<Alarm, 'id'>) => {
    const alarms = alarmsQuery.data || [];
    const newAlarm: Alarm = { ...alarm, id: Date.now().toString() };
    saveAlarmsMutation.mutate([...alarms, newAlarm]);
    return newAlarm;
  };

  // Aktualizuje istniejący alarm
  const updateAlarm = (updatedAlarm: Alarm) => {
    const alarms = alarmsQuery.data || [];
    const updatedAlarms = alarms.map(a => a.id === updatedAlarm.id ? updatedAlarm : a);
    saveAlarmsMutation.mutate(updatedAlarms);
  };

  // Usuwa alarm
  const deleteAlarm = (id: string) => {
    const alarms = alarmsQuery.data || [];
    const updatedAlarms = alarms.filter(alarm => alarm.id !== id);
    if (activeAlarm?.id === id) {
      setActiveAlarm(null); // Zdezaktywuj alarm, jeśli jest usuwany
    }
    saveAlarmsMutation.mutate(updatedAlarms);
  };

  // Przełącza stan włączenia/wyłączenia alarmu
  const toggleAlarmEnabled = (id: string) => {
    const alarms = alarmsQuery.data || [];
    const updatedAlarms = alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
    saveAlarmsMutation.mutate(updatedAlarms);
  };

  // Efekt sprawdzający co minutę, czy któryś alarm powinien się włączyć
  useEffect(() => {
    const checkAlarms = () => {
      // Jeśli alarm jest już aktywny (dzwoni lub drzemie), nie wyzwalaj kolejnego.
      if (activeAlarm) return;

      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentDay = getDayOfWeek(now);
      
      const alarmToTrigger = alarmsQuery.data?.find(alarm => {
        if (!alarm.enabled) return false; // Alarm musi być włączony
        
        const [alarmHours, alarmMinutes] = alarm.time.split(':').map(Number);

        // Sprawdź, czy aktualna godzina i minuta pasują do alarmu
        if (alarmHours === currentHours && alarmMinutes === currentMinutes) {
          // Jeśli ustawiona jest konkretna data, sprawdź, czy to dzisiaj
          if (alarm.specificDate) {
            const alarmDate = new Date(alarm.specificDate);
            return alarmDate.getDate() === now.getDate() &&
                   alarmDate.getMonth() === now.getMonth() &&
                   alarmDate.getFullYear() === now.getFullYear();
          }
          
          // Jeśli nie ma konkretnej daty, sprawdź dni tygodnia
          // Jeśli alarm.days jest puste, to alarm jednorazowy bez konkretnej daty.
          // W takim przypadku powinien zadzwonić raz i zostać wyłączony.
          if (alarm.days.length === 0) {
            return true; // Czas się zgadza, to alarm jednorazowy
          }
          
          // Dla alarmów powtarzalnych, sprawdź, czy aktualny dzień jest w wybranych dniach
          return alarm.days.includes(currentDay);
        }
        return false;
      });
      
      if (alarmToTrigger) {
        // Jeśli to alarm jednorazowy (bez specificDate i bez dni), wyłącz go natychmiast po wyzwoleniu.
        // Zapobiega to dzwonieniu alarmu ponownie następnego dnia, jeśli nie zostanie odrzucony.
        if (alarmToTrigger.days.length === 0 && !alarmToTrigger.specificDate) {
          const tempDisabledAlarm = { ...alarmToTrigger, enabled: false };
          saveAlarmsMutation.mutate((alarmsQuery.data ?? []).map(a => a.id === tempDisabledAlarm.id ? tempDisabledAlarm : a));
        }
        setActiveAlarm({ ...alarmToTrigger, snoozeCount: 0, isSnoozing: false });
        router.push('/alarm/active');
      }
    };

    const checkInterval = setInterval(checkAlarms, 60000); // Sprawdzaj co 60 sekund

    // Wywołaj checkAlarms natychmiast po zamontowaniu, aby sprawdzić alarmy, które mogły zostać pominięte
    // z powodu opóźnienia interwału.
    checkAlarms(); 

    return () => clearInterval(checkInterval);
  }, [alarmsQuery.data, activeAlarm]);

  // Aktywuje drzemkę dla aktywnego alarmu
  const snoozeAlarm = () => {
    if (!activeAlarm?.snoozeEnabled) return;

    const snoozedAlarm = { ...activeAlarm, snoozeCount: activeAlarm.snoozeCount + 1, isSnoozing: true };
    setActiveAlarm(snoozedAlarm);
    
    // Nawiguj natychmiast po ustawieniu stanu drzemki
    router.replace('/');

    setTimeout(() => {
      setActiveAlarm(prev => (prev?.id === snoozedAlarm.id ? { ...prev, isSnoozing: false } : prev));
      router.push('/alarm/active');
    }, snoozedAlarm.snoozeDuration * 60 * 1000);
  };

  // Wyłącza aktywny alarm
  const dismissAlarm = () => {
    if (!activeAlarm) return;
    
    // Najpierw wyłącz alarm, jeśli jest jednorazowy
    if (activeAlarm.days.length === 0 && !activeAlarm.specificDate) {
      const alarms = alarmsQuery.data || [];
      const updatedAlarms = alarms.map(a => 
        a.id === activeAlarm.id ? { ...a, enabled: false } : a
      );
      saveAlarmsMutation.mutate(updatedAlarms);
    }
    
    // Nawiguj do głównego ekranu przed zmianą stanu
    router.replace('/');
    
    // Następnie wyczyść aktywny alarm
    setActiveAlarm(null);
  };

  // Wyłącza alarm po rozwiązaniu wyzwania matematycznego
  const dismissAlarmAfterMath = () => {
    if (!activeAlarm) return;

    // Najpierw wyłącz alarm, jeśli jest jednorazowy
    if (activeAlarm.days.length === 0 && !activeAlarm.specificDate) {
      const alarms = alarmsQuery.data || [];
      const updatedAlarms = alarms.map(a => 
        a.id === activeAlarm.id ? { ...a, enabled: false } : a
      );
      saveAlarmsMutation.mutate(updatedAlarms);
    }
    
    // Nawiguj do głównego ekranu przed zmianą stanu
    router.replace('/');
    
    // Następnie wyczyść aktywny alarm
    setActiveAlarm(null);
  };

  return {
    alarms: alarmsQuery.data || [],
    isLoading: alarmsQuery.isLoading,
    activeAlarm,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarmEnabled,
    snoozeAlarm,
    dismissAlarm,
    dismissAlarmAfterMath
  };
});

/**
 * Hook pomocniczy do pobierania posortowanej listy alarmów.
 * Sortuje alarmy wg statusu (włączone najpierw), a następnie wg godziny.
 */
export const useSortedAlarms = () => {
  const { alarms } = useAlarms();
  
  return [...alarms].sort((a, b) => {
    if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
    return a.time.localeCompare(b.time);
  });
};