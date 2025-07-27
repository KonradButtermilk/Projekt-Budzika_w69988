import * as MediaLibrary from 'expo-media-library';

export const requestMediaLibraryPermission = async () => {
  const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
  return {
    granted: status === 'granted',
    canAskAgain
  };
};
