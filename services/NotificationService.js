import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Klasa NotificationService zarządza uprawnieniami i planowaniem powiadomień.
 */
class NotificationService {
  /**
   * Prosi użytkownika o uprawnienia do wysyłania powiadomień.
   * Powinna być wywołana na początku działania aplikacji lub przed pierwszym użyciem powiadomień.
   * @returns {Promise<boolean>} True, jeśli uprawnienia zostały przyznane, w przeciwnym razie false.
   */
  static async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Jeśli uprawnienia nie zostały jeszcze przyznane, poproś o nie.
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Jeśli użytkownik nie przyznał uprawnień, wyświetl alert.
    if (finalStatus !== 'granted') {
      alert('Aby budzik działał poprawnie, musisz włączyć powiadomienia w ustawieniach aplikacji!');
      return false;
    }
    return true;
  }

  /**
   * Konfiguruje kanał powiadomień dla Androida.
   * Kanały są wymagane na Androidzie 8.0 (API level 26) i nowszych.
   */
  static async configureNotificationChannel() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alarm', {
        name: 'Alarmy',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default', // Domyślny dźwięk powiadomienia
        vibrationPattern: [0, 250, 250, 250], // Wibracja: start, wibracja, pauza, wibracja
        lightColor: '#FF231F7C',
      });
    }
  }

  /**
   * Planuje lokalne powiadomienie dla alarmu.
   * @param {object} alarm - Obiekt alarmu zawierający czas, etykietę i opcję wibracji.
   * @returns {Promise<string>} ID zaplanowanego powiadomienia.
   */
  static async scheduleAlarmNotification(alarm) {
    // Anuluj wszystkie istniejące powiadomienia, aby uniknąć duplikatów.
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();
    const [hours, minutes] = alarm.time.split(':').map(Number);

    let alarmDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

    // Jeśli czas alarmu jest w przeszłości, ustaw go na jutro.
    if (alarmDate.getTime() < now.getTime()) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }

    // Skonfiguruj kanał powiadomień (tylko dla Androida).
    await this.configureNotificationChannel();

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Budzik',
        body: alarm.label || `Alarm o ${alarm.time}`,
        sound: 'default', // Użyj domyślnego dźwięku systemowego
        vibrate: alarm.vibrate ? [0, 250, 250, 250] : undefined, // Wibracja, jeśli włączona
        data: { alarmId: alarm.id }, // Przekaż ID alarmu w danych powiadomienia
      },
      trigger: {
        date: alarmDate,
        repeats: false, // Alarm jednorazowy, będzie ponownie planowany po każdym uruchomieniu aplikacji
      },
    });

    console.log(`Zaplanowano powiadomienie dla alarmu ${alarm.id} o ${alarm.time}. ID powiadomienia: ${notificationId}`);
    return notificationId;
  }

  /**
   * Anuluje zaplanowane powiadomienie.
   * @param {string} notificationId - ID powiadomienia do anulowania.
   * @returns {Promise<void>}
   */
  static async cancelNotification(notificationId) {
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Anulowano powiadomienie o ID: ${notificationId}`);
    }
  }

  /**
   * Anuluje wszystkie zaplanowane powiadomienia.
   * Przydatne przy starcie aplikacji, aby uniknąć duplikatów i ponownie zaplanować aktywne alarmy.
   * @returns {Promise<void>}
   */
  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Anulowano wszystkie zaplanowane powiadomienia.');
  }
}

export default NotificationService;
