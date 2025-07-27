import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Colors from '@/constants/colors';
import { formatTime } from '@/utils/dateUtils';

interface TimePickerModalProps {
  visible: boolean;
  initialTime: string;
  onClose: () => void;
  onSave: (time: string) => void;
}

/**
 * Modal do wyboru godziny.
 * Umożliwia użytkownikowi ustawienie godziny i minuty alarmu za pomocą przycisków.
 */
export default function TimePickerModal({ 
  visible, 
  initialTime, 
  onClose, 
  onSave 
}: TimePickerModalProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  // Ustaw czas początkowy, gdy modal staje się widoczny
  useEffect(() => {
    if (visible) {
      const [initialHours, initialMinutes] = initialTime.split(':').map(Number);
      setHours(initialHours);
      setMinutes(initialMinutes);
    }
  }, [visible, initialTime]);

  // Zapisuje wybrany czas i zamyka modal
  const handleSave = () => {
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    onSave(`${formattedHours}:${formattedMinutes}`);
    onClose();
  };

  // Funkcje do inkrementacji i dekrementacji godzin i minut
  const incrementHours = () => setHours(prev => (prev + 1) % 24);
  const decrementHours = () => setHours(prev => (prev - 1 + 24) % 24);
  const incrementMinutes = () => setMinutes(prev => (prev + 1) % 60);
  const decrementMinutes = () => setMinutes(prev => (prev - 1 + 60) % 60);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Set Time</Text>
          
          <View style={styles.timePickerContainer}>
            {/* Kolumna godzin */}
            <View style={styles.timeColumn}>
              <TouchableOpacity onPress={incrementHours} style={styles.timeButton}><Text style={styles.timeButtonText}>▲</Text></TouchableOpacity>
              <Text style={styles.timeValue}>{hours.toString().padStart(2, '0')}</Text>
              <TouchableOpacity onPress={decrementHours} style={styles.timeButton}><Text style={styles.timeButtonText}>▼</Text></TouchableOpacity>
            </View>
            
            <Text style={styles.timeSeparator}>:</Text>
            
            {/* Kolumna minut */}
            <View style={styles.timeColumn}>
              <TouchableOpacity onPress={incrementMinutes} style={styles.timeButton}><Text style={styles.timeButtonText}>▲</Text></TouchableOpacity>
              <Text style={styles.timeValue}>{minutes.toString().padStart(2, '0')}</Text>
              <TouchableOpacity onPress={decrementMinutes} style={styles.timeButton}><Text style={styles.timeButtonText}>▼</Text></TouchableOpacity>
            </View>
          </View>
          
          {/* Podgląd sformatowanego czasu */}
          <Text style={styles.previewText}>
            {formatTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)}
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton]}><Text style={styles.saveButtonText}>Save</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: Colors.light.background, borderRadius: 12, padding: 20, alignItems: 'center', ...Platform.select({ ios: { boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)' }, android: { elevation: 5 } }) },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 20, color: Colors.light.text },
  timePickerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  timeColumn: { alignItems: 'center', width: 60 },
  timeButton: { padding: 10 },
  timeButtonText: { fontSize: 24, color: Colors.light.primary },
  timeValue: { fontSize: 36, fontWeight: 'bold', marginVertical: 10, color: Colors.light.text },
  timeSeparator: { fontSize: 36, fontWeight: 'bold', marginHorizontal: 10, color: Colors.light.text },
  previewText: { fontSize: 18, color: Colors.light.gray[600], marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  button: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  cancelButton: { backgroundColor: Colors.light.gray[200] },
  cancelButtonText: { color: Colors.light.gray[700], fontWeight: '600' },
  saveButton: { backgroundColor: Colors.light.primary },
  saveButtonText: { color: 'white', fontWeight: '600' },
});
