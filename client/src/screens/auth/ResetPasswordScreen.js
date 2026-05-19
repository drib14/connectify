import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Save } from 'lucide-react-native';
import api from '../../utils/api';
import { ScreenSkeleton } from '../../components/Skeletons';

export default function ResetPasswordScreen({ route, navigation }) {
  const { email, otp } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword: password });
      Alert.alert('Success', 'Password reset successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ScreenSkeleton />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-6 justify-center">
        <View className="items-center mb-8">
          <Text className="text-3xl font-roboto text-primary-700 font-bold">Reset Password</Text>
          <Text className="text-gray-500 mt-2 font-roboto text-center">
            Create a new strong password for your account.
          </Text>
        </View>

        <View className="flex-row items-center bg-primary-50 rounded-xl px-4 py-3 border border-primary-100 mb-4">
          <Lock color="#7e22ce" size={20} />
          <TextInput
            className="flex-1 ml-3 font-roboto text-gray-800 text-base"
            placeholder="New Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View className="flex-row items-center bg-primary-50 rounded-xl px-4 py-3 border border-primary-100 mb-8">
          <Lock color="#7e22ce" size={20} />
          <TextInput
            className="flex-1 ml-3 font-roboto text-gray-800 text-base"
            placeholder="Confirm New Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity
          className="bg-primary-600 py-4 rounded-full flex-row justify-center items-center shadow-sm shadow-primary-500"
          onPress={handleResetPassword}
        >
          <Save color="white" size={20} className="mr-2" />
          <Text className="text-white font-roboto font-bold text-lg">Reset Password</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}