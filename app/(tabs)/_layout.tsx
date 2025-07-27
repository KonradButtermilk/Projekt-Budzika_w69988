import { Tabs } from "expo-router";
import { AlarmClock, Plus } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import Colors from "@/constants/colors";

/**
 * Główny layout zakładek aplikacji.
 * Definiuje strukturę nawigacji zakładek i wygląd nagłówka.
 */
export default function TabLayout() {
  // Funkcja nawigująca do ekranu tworzenia nowego alarmu.
  const handleAddAlarm = () => {
    router.push('/alarm/new');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary, // Kolor aktywnej zakładki
        headerShown: true, // Pokazuje nagłówek
      }}
    >
      {/* Definicja ekranu głównej zakładki z listą alarmów */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Alarms", // Tytuł w nagłówku
          tabBarIcon: ({ color }) => <AlarmClock color={color} />, // Ikona zakładki
          // Komponent po prawej stronie nagłówka (przycisk "+")
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 16 }}
              onPress={handleAddAlarm}
              testID="add-alarm-button"
            >
              <Plus color={Colors.light.primary} size={24} />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
