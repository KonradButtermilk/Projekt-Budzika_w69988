import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'; // Wymagane przez uuid
import { v4 as uuidv4 } from 'uuid';
import * as Notifications from 'expo-notifications';

import NotificationService from './NotificationService';

// Klucz, pod którym alarmy będą przechowywane w AsyncStorage.
const ALARMS_STORAGE_KEY = 'alarms';

/**
 * Klasa AlarmService zarządza logiką dodawania, usuwania, edycji i przechowywania alarmów.
 * Odpowiada również za planowanie i anulowanie powiadomień związanych z alarmami.
 */
class AlarmService {
  /**
   * Pobiera wszystkie zapisane alarmy z AsyncStorage.
   * @returns {Promise<Array<object>>} Lista alarmów.
   */
  static async getAlarms() {
    try {
      const jsonValue = await AsyncStorage.getItem(ALARMS_STORAGE_KEY);
      // Parsuje JSON lub zwraca pustą tablicę, jeśli brak alarmów.
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Błąd podczas ładowania alarmów:', e);
      return [];
    }
  }

  /**
   * Zapisuje pojedynczy alarm. Jeśli alarm ma już ID, jest aktualizowany; w przeciwnym razie dodawany jest nowy.
   * Planuje również powiadomienie dla alarmu, jeśli jest aktywny.
   * @param {object} alarm - Obiekt alarmu do zapisania. Powinien zawierać: { id?: string, time: string, label: string, isEnabled: boolean, vibrate: boolean }.
   * @returns {Promise<void>}
   */
  static async saveAlarm(alarm) {
    let alarms = await this.getAlarms();
    let newAlarm = { ...alarm };

    if (newAlarm.id) {
      // Jeśli alarm ma ID, znajdź go i zaktualizuj.
      const index = alarms.findIndex(a => a.id === newAlarm.id);
      if (index > -1) {
        // Anuluj poprzednie powiadomienie, jeśli istniało.
        if (alarms[index].notificationId) {
          await Notifications.cancelScheduledNotificationAsync(alarms[index].notificationId);
        }
        alarms[index] = newAlarm;
      } else {
        // Jeśli ID istnieje, ale alarm nie został znaleziony (np. błąd), dodaj jako nowy.
        newAlarm.id = uuidv4();
        alarms.push(newAlarm);
      }
    } else {
      // Jeśli alarm nie ma ID, wygeneruj nowe i dodaj do listy.
      newAlarm.id = uuidv4();
      alarms.push(newAlarm);
    }

    // Jeśli alarm jest aktywny, zaplanuj powiadomienie.
    if (newAlarm.isEnabled) {
      const notificationId = await NotificationService.scheduleAlarmNotification(newAlarm);
      newAlarm.notificationId = notificationId; // Zapisz ID powiadomienia w obiekcie alarmu.
    } else if (newAlarm.notificationId) {
      // Jeśli alarm jest nieaktywny, ale ma zaplanowane powiadomienie, anuluj je.
      await Notifications.cancelScheduledNotificationAsync(newAlarm.notificationId);
      delete newAlarm.notificationId; // Usuń ID powiadomienia.
    }

    try {
      await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
    } catch (e) {
      console.error('Błąd podczas zapisywania alarmu:', e);
    }
  }

  /**
   * Usuwa alarm o podanym ID.
   * Anuluje również powiadomienie związane z tym alarmem.
   * @param {string} id - ID alarmu do usunięcia.
   * @returns {Promise<void>}
   */
  static async deleteAlarm(id) {
    let alarms = await this.getAlarms();
    const alarmToDelete = alarms.find(a => a.id === id);

    if (alarmToDelete && alarmToDelete.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(alarmToDelete.notificationId);
    }

    alarms = alarms.filter(alarm => alarm.id !== id);
    try {
      await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
    } catch (e) {
      console.error('Błąd podczas usuwania alarmu:', e);
    }
  }

  /**
   * Przełącza stan aktywności alarmu (włącz/wyłącz).
   * Odpowiednio planuje lub anuluje powiadomienie.
   * @param {string} id - ID alarmu do przełączenia.
   * @param {boolean} isEnabled - Nowy stan aktywności alarmu.
   * @returns {Promise<void>}
   */
  static async toggleAlarm(id, isEnabled) {
    let alarms = await this.getAlarms();
    const index = alarms.findIndex(a => a.id === id);

    if (index > -1) {
      const alarmToToggle = { ...alarms[index], isEnabled: isEnabled };

      if (isEnabled) {
        // Jeśli włączamy alarm, zaplanuj powiadomienie.
        const notificationId = await NotificationService.scheduleAlarmNotification(alarmToToggle);
        alarmToToggle.notificationId = notificationId;
      } else if (alarmToToggle.notificationId) {
        // Jeśli wyłączamy alarm, anuluj powiadomienie.
        await Notifications.cancelScheduledNotificationAsync(alarmToToggle.notificationId);
        delete alarmToToggle.notificationId;
      }
      alarms[index] = alarmToToggle;
      try {
        await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
      } catch (e) {
        console.error('Błąd podczas przełączania alarmu:', e);
      }
    }
  }

  /**
   * Ponownie planuje wszystkie aktywne alarmy po restarcie aplikacji lub zmianie czasu systemowego.
   * Ta funkcja powinna być wywołana przy starcie aplikacji.
   * @returns {Promise<void>}
   */
  static async rescheduleAllAlarms() {
    const alarms = await this.getAlarms();
    for (const alarm of alarms) {
      if (alarm.isEnabled) {
        // Anuluj stare powiadomienie, jeśli istnieje.
        if (alarm.notificationId) {
          await Notifications.cancelScheduledNotificationAsync(alarm.notificationId);
        }
        // Zaplanuj nowe powiadomienie.
        const notificationId = await NotificationService.scheduleAlarmNotification(alarm);
        alarm.notificationId = notificationId;
      }
    }
    // Zapisz zaktualizowane alarmy z nowymi ID powiadomień.
    try {
      await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
    } catch (e) {
      console.error('Błąd podczas ponownego planowania alarmów:', e);
    }
  }
}

export default AlarmService;
