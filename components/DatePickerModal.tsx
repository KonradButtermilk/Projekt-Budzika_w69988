import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface DatePickerModalProps {
  visible: boolean;
  initialDate?: Date;
  onClose: () => void;
  onSave: (date: Date | undefined) => void;
}

/**
 * Modal do wyboru daty.
 * Umożliwia wybranie konkretnej daty z kalendarza dla alarmu jednorazowego.
 */
export default function DatePickerModal({ 
  visible, 
  initialDate, 
  onClose, 
  onSave 
}: DatePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Aktualizuj miesiąc, gdy zmienia się data początkowa
  useEffect(() => {
    setCurrentMonth(initialDate || new Date());
  }, [initialDate]);

  // Zapisuje wybraną datę i zamyka modal
  const handleSave = () => {
    onSave(selectedDate);
    onClose();
  };

  // Czyści wybraną datę
  const handleClear = () => {
    setSelectedDate(undefined);
  };

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const isSameDate = (d1: Date, d2?: Date) => d1 && d2 && d1.toDateString() === d2.toDateString();

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Renderuje siatkę kalendarza dla bieżącego miesiąca
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = isSameDate(date, selectedDate);
      const isPast = isPastDate(date);
      const todayDate = isToday(date);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell, styles.dayButton,
            isSelected && styles.selectedDay,
            todayDate && !isSelected && styles.todayDay,
            isPast && styles.pastDay,
          ]}
          onPress={() => !isPast && setSelectedDate(date)}
          disabled={isPast}
        >
          <Text style={[ styles.dayText, isSelected && styles.selectedDayText, todayDate && styles.todayDayText, isPast && styles.pastDayText ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const getMonthName = (date: Date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}><X size={24} color={Colors.light.gray[500]} /></TouchableOpacity>
          </View>
          
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}><ChevronLeft size={20} color={Colors.light.primary} /></TouchableOpacity>
            <Text style={styles.monthText}>{getMonthName(currentMonth)}</Text>
            <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}><ChevronRight size={20} color={Colors.light.primary} /></TouchableOpacity>
          </View>
          
          <View style={styles.weekDays}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <Text key={i} style={styles.weekDayText}>{day}</Text>)}
          </View>
          
          <View style={styles.calendar}>{renderCalendar()}</View>
          
          {selectedDate && (
            <View style={styles.selectedDateInfo}>
              <Text style={styles.selectedDateText}>Selected: {selectedDate.toLocaleDateString()}</Text>
              <TouchableOpacity onPress={handleClear} style={styles.clearButton}><Text style={styles.clearButtonText}>Clear</Text></TouchableOpacity>
            </View>
          )}
          
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
  modalContent: { backgroundColor: Colors.light.background, borderRadius: 16, padding: 20, width: '90%', maxWidth: 400 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '600', color: Colors.light.text },
  closeButton: { padding: 4 },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  navButton: { padding: 8 },
  monthText: { fontSize: 18, fontWeight: '600', color: Colors.light.text },
  weekDays: { flexDirection: 'row', marginBottom: 8 },
  weekDayText: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '500', color: Colors.light.gray[600] },
  calendar: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  dayCell: { width: '14.28%', height: 40, justifyContent: 'center', alignItems: 'center' },
  dayButton: { borderRadius: 20 },
  dayText: { fontSize: 16, color: Colors.light.text },
  selectedDay: { backgroundColor: Colors.light.primary },
  selectedDayText: { color: 'white', fontWeight: '600' },
  todayDay: { borderWidth: 2, borderColor: Colors.light.primary, borderRadius: 20 },
  todayDayText: { color: Colors.light.primary, fontWeight: '600' },
  pastDay: { opacity: 0.4 },
  pastDayText: { color: Colors.light.gray[400] },
  selectedDateInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: Colors.light.gray[100], borderRadius: 8, marginBottom: 16 },
  selectedDateText: { fontSize: 16, color: Colors.light.text },
  clearButton: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, backgroundColor: Colors.light.danger },
  clearButtonText: { color: 'white', fontSize: 14, fontWeight: '500' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: Colors.light.gray[200] },
  cancelButtonText: { color: Colors.light.text, fontSize: 16, fontWeight: '600' },
  saveButton: { backgroundColor: Colors.light.primary },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
