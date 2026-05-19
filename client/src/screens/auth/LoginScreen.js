import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';
import { ScreenSkeleton } from '../../components/Skeletons';

GoogleSignin.configure({
  webClientId: '396239610433-d2ufuhigi4najsq23445ot2msre22pbc.apps.googleusercontent.com',
  offlineAccess: true,
});

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      await loginUser(userData, token);
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || userInfo.idToken;

      setLoading(true);
      const response = await api.post('/auth/google', { idToken });
      const { token, ...userData } = response.data;
      await loginUser(userData, token);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Operation is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Play services not available or outdated');
      } else {
        console.error('Google Sign-In Error:', error);
        Alert.alert('Login Failed', 'Google Sign-In failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ScreenSkeleton />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-6 justify-center">
        <View className="items-center mb-10">
          <Text className="text-4xl font-roboto text-primary-700 font-bold tracking-wide">
            Connectify
          </Text>
          <Text className="text-gray-500 mt-2 font-roboto text-base">Login to your account</Text>
        </View>

        <View className="space-y-4">
          <View className="flex-row items-center bg-primary-50 rounded-xl px-4 py-3 border border-primary-100 mb-4">
            <Mail color="#7e22ce" size={20} />
            <TextInput
              className="flex-1 ml-3 font-roboto text-gray-800 text-base"
              placeholder="Email Address"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="flex-row items-center bg-primary-50 rounded-xl px-4 py-3 border border-primary-100 mb-2">
            <Lock color="#7e22ce" size={20} />
            <TextInput
              className="flex-1 ml-3 font-roboto text-gray-800 text-base"
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            className="items-end mb-6"
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text className="text-primary-600 font-roboto font-medium">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-primary-600 py-4 rounded-full flex-row justify-center items-center mb-4 shadow-sm shadow-primary-500"
            onPress={handleLogin}
          >
            <LogIn color="white" size={20} className="mr-2" />
            <Text className="text-white font-roboto font-bold text-lg">Login</Text>
          </TouchableOpacity>

          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="px-4 text-gray-400 font-roboto">OR</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <TouchableOpacity
            className="bg-white border border-gray-200 py-3 rounded-full flex-row justify-center items-center"
            onPress={handleGoogleLogin}
          >
            {/* Simple placeholder for google icon */}
            <View className="w-6 h-6 bg-red-500 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold text-xs">G</Text>
            </View>
            <Text className="text-gray-700 font-roboto font-medium text-base">Continue with Google</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500 font-roboto">Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-primary-600 font-roboto font-bold">Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}