import 'react-native-gesture-handler';
import './global.css';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import useAuthStore from './src/store/useAuthStore';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';
import ConnectifySplash from './src/components/ConnectifySplash';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  const { user, isLoading, loadStorageData } = useAuthStore();
  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  let [fontsLoaded] = useFonts({
    Roboto: Roboto_400Regular,
    Roboto_Bold: Roboto_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        await loadStorageData();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady && fontsLoaded) {
      SplashScreen.hideAsync();
      // Hide custom splash after 2.5 seconds
      setTimeout(() => setShowCustomSplash(false), 2500);
    }
  }, [appIsReady, fontsLoaded]);

  const linking = {
    prefixes: ['connectify://', Linking.createURL('/')],
    config: {
      screens: {
        Auth: {
          screens: {
            VerifyEmail: 'verify/:token',
          }
        }
      }
    }
  };

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  if (showCustomSplash) {
    return <ConnectifySplash />;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
