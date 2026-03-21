import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value)
    return
  }

  await SecureStore.setItemAsync(key, value)
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key)
  }

  return SecureStore.getItemAsync(key)
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key)
    return
  }

  await SecureStore.deleteItemAsync(key)
}

export const secureStorage = {
  getItem,
  setItem,
  removeItem,
} as const
