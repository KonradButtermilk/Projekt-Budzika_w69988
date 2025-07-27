import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Play, Pause, Check, Plus } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import Colors from '@/constants/colors';
import { alarmTones, AlarmTone, getCustomTones, addCustomTone } from '@/constants/alarmTones';
import { requestMediaLibraryPermission } from '@/utils/permissions';

interface ToneSelectorProps {
  selectedToneId: string;
  onToneSelect: (toneId: string) => void;
}

export default function ToneSelector({ selectedToneId, onToneSelect }: ToneSelectorProps) {
  const [playingToneId, setPlayingToneId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [customTones, setCustomTones] = useState<AlarmTone[]>([]);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const stopCurrentSound = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setPlayingToneId(null);
  };

  useEffect(() => {
    const loadCustomTones = async () => {
      const tones = await getCustomTones();
      setCustomTones(tones);
    };
    loadCustomTones();
  }, []);

  const pickCustomTone = async () => {
    try {
      if (Platform.OS !== 'web') {
        const permissionResult = await requestMediaLibraryPermission();
        if (!permissionResult.granted) {
          Alert.alert(
            'Permission Required',
            'The app needs access to your media library to add custom alarm sounds.'
          );
          return;
        }
      }

      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true
      });

      console.log('Picker result:', pickerResult);

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const asset = pickerResult.assets[0];
        const newTone: AlarmTone = {
          id: `custom-${Date.now()}`,
          name: asset.name ?? 'Custom Sound',
          url: asset.uri,
          isCustom: true
        };
        
        console.log('Adding new tone:', newTone);
        await addCustomTone(newTone);
        const updatedTones = await getCustomTones();
        setCustomTones(updatedTones);
        onToneSelect(newTone.id);
      }
    } catch (error) {
      console.error('Error picking audio file:', error);
      Alert.alert('Error', 'Failed to add custom sound.');
    }
  };

  const playTone = async (tone: AlarmTone) => {
    try {
      if (playingToneId === tone.id) {
        await stopCurrentSound();
        return;
      }

      await stopCurrentSound();

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: tone.url },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setPlayingToneId(tone.id);

      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          stopCurrentSound();
        }
      });
    } catch (error) {
      console.error('Error playing tone:', error);
      setPlayingToneId(null);
    }
  };

  const allTones = [...alarmTones, ...customTones];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addCustomToneButton}
        onPress={pickCustomTone}
        testID="add-custom-tone"
      >
        <Plus size={18} color={Colors.light.primary} />
        <Text style={styles.addCustomToneText}>Add Custom Sound</Text>
      </TouchableOpacity>

      <View style={styles.tonesList}>
        {allTones.map(item => {
          const isSelected = selectedToneId === item.id;
          const isPlaying = playingToneId === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.toneItem, isSelected && styles.selectedToneItem]}
              onPress={() => onToneSelect(item.id)}
              testID={`tone-${item.id}`}
            >
              <Text style={[styles.toneName, isSelected && styles.selectedToneName]}>
                {item.name}
                {item.isCustom && ' (Custom)'}
              </Text>
              
              <View style={styles.toneActions}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    playTone(item);
                  }}
                  testID={`play-tone-${item.id}`}
                >
                  {isPlaying ? (
                    <Pause size={18} color={Colors.light.primary} />
                  ) : (
                    <Play size={18} color={Colors.light.primary} />
                  )}
                </TouchableOpacity>
                
                {isSelected && (
                  <Check size={18} color={Colors.light.primary} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  addCustomToneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.light.gray[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.gray[200],
    borderStyle: 'dashed',
    gap: 8,
  },
  addCustomToneText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  tonesList: {
    gap: 8,
  },
  toneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.gray[100],
  },
  selectedToneItem: {
    backgroundColor: Colors.light.primary + '20',
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  toneName: {
    fontSize: 16,
    color: Colors.light.text,
  },
  selectedToneName: {
    fontWeight: '600',
  },
  toneActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    padding: 8,
    backgroundColor: Colors.light.gray[200],
    borderRadius: 20,
  },
});