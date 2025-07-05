import React, { useState, useEffect } from 'react';
import { View, Button, Text, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function App() {
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  const scheduleAlarm = async () => {
    const now = new Date();
    const alarmTime = new Date(time);
    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Alarm',
        body: 'Wake up!',
      },
      trigger: alarmTime,
    });
  };

  const onTimeChange = (_event, selectedDate) => {
    const currentDate = selectedDate || time;
    setShowPicker(Platform.OS === 'ios');
    setTime(currentDate);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Wybierz godzinę" onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}
      <Text style={{ marginVertical: 20 }}>
        Budzik ustawiony na: {time.toLocaleTimeString()}
      </Text>
      <Button title="Ustaw budzik" onPress={scheduleAlarm} />
    </View>
  );
}
