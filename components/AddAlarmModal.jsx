import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, TextInput, TouchableOpacity, Switch } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Komponent AddAlarmModal to modal (okno dialogowe) służące do dodawania nowych alarmów
 * lub edytowania istniejących. Umożliwia wybór czasu, ustawienie etykiety i opcji wibracji.
 */
export default function AddAlarmModal({ visible, onClose, onSave, initialAlarm }) {
  // Stan dla wybranego czasu alarmu (format HH:mm).
  const [time, setTime] = useState('00:00');
  // Stan dla etykiety/nazwy alarmu.
  const [label, setLabel] = useState('');
  // Stan dla opcji wibracji.
  const [vibrate, setVibrate] = useState(true);
  // Stan kontrolujący widoczność pickera czasu.
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const colorScheme = useColorScheme();
  const isLight = colorScheme === 'light';

  /**
   * Efekt `useEffect` jest używany do inicjalizacji stanu modalu
   * na podstawie `initialAlarm` (jeśli edytujemy istniejący alarm).
   * Uruchamia się za każdym razem, gdy `initialAlarm` lub `visible` się zmienia.
   */
  useEffect(() => {
    if (initialAlarm) {
      // Jeśli edytujemy alarm, ustaw jego wartości początkowe.
      setTime(initialAlarm.time);
      setLabel(initialAlarm.label || '');
      setVibrate(initialAlarm.vibrate ?? true);
    } else {
      // Jeśli dodajemy nowy alarm, zresetuj wartości.
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      setTime(`${currentHour}:${currentMinute}`);
      setLabel('');
      setVibrate(true);
    }
  }, [initialAlarm, visible]);

  /**
   * Obsługuje potwierdzenie wyboru czasu z pickera.
   * @param {Date} selectedTime - Wybrana data i czas.
   */
  const handleConfirmTime = (selectedTime) => {
    const hours = selectedTime.getHours().toString().padStart(2, '0');
    const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
    setTime(`${hours}:${minutes}`);
    setTimePickerVisible(false);
  };

  /**
   * Obsługuje zapisywanie alarmu.
   * Tworzy obiekt alarmu i przekazuje go do funkcji `onSave`.
   */
  const handleSave = () => {
    const alarmToSave = {
      id: initialAlarm ? initialAlarm.id : undefined, // Zachowaj ID, jeśli edytujemy
      time,
      label,
      vibrate,
      isEnabled: initialAlarm ? initialAlarm.isEnabled : true, // Zachowaj stan, jeśli edytujemy, w przeciwnym razie domyślnie włączony
    };
    onSave(alarmToSave);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} // Obsługa przycisku Wstecz na Androidzie
    >
      <ThemedView style={styles.centeredView}>
        <ThemedView style={styles.modalView}>
          {/* Nagłówek modalu */}
          <ThemedText type="title" style={styles.modalTitle}>
            {initialAlarm ? 'Edytuj Alarm' : 'Dodaj Alarm'}
          </ThemedText>

          {/* Wybór czasu */}
          <TouchableOpacity onPress={() => setTimePickerVisible(true)} style={styles.timeInput}>
            <ThemedText type="subtitle">{time}</ThemedText>
          </TouchableOpacity>
          <DateTimePicker
            isVisible={isTimePickerVisible}
            mode="time"
            onConfirm={handleConfirmTime}
            onCancel={() => setTimePickerVisible(false)}
            date={new Date(`2000-01-01T${time}:00`)} // Ustawienie początkowej daty dla pickera
          />

          {/* Pole tekstowe dla etykiety */}
          <TextInput
            style={[styles.textInput, { color: isLight ? Colors.light.text : Colors.dark.text, borderColor: isLight ? Colors.light.icon : Colors.dark.icon }]} // Ustawienie koloru tekstu i obramowania
            placeholder="Etykieta alarmu (opcjonalnie)"
            placeholderTextColor={isLight ? Colors.light.tabIconDefault : Colors.dark.tabIconDefault}
            value={label}
            onChangeText={setLabel}
          />

          {/* Opcja wibracji */}
          <View style={styles.optionRow}>
            <ThemedText>Wibracje</ThemedText>
            <Switch
              trackColor={{ false: isLight ? Colors.light.tabIconDefault : Colors.dark.tabIconDefault, true: Colors[colorScheme].tint }}
              thumbColor={isLight ? Colors.light.background : Colors.dark.background}
              ios_backgroundColor={isLight ? Colors.light.tabIconDefault : Colors.dark.tabIconDefault}
              onValueChange={setVibrate}
              value={vibrate}
            />
          </View>

          {/* Przyciski akcji */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <ThemedText style={styles.buttonText}>Anuluj</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]}>
              <ThemedText style={styles.buttonText}>Zapisz</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Półprzezroczyste tło
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    marginBottom: 20,
  },
  timeInput: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'gray',
  },
  textInput: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545', // Czerwony
  },
  saveButton: {
    backgroundColor: '#28a745', // Zielony
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
