import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Send } from 'lucide-react-native';
import api from '../../utils/api';
import { ScreenSkeleton } from '../../components/Skeletons';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      Alert.alert('Success', 'OTP sent to your email');
      navigation.navigate('Otp', { email });
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
          <Text className="text-3xl font-roboto text-primary-700 font-bold">Forgot Password</Text>
          <Text className="text-gray-500 mt-2 font-roboto text-center">
            Enter your email address and we&apos;ll send you an OTP to reset your password.
          </Text>
        </View>

        <View className="flex-row items-center bg-primary-50 rounded-xl px-4 py-3 border border-primary-100 mb-8">
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

        <TouchableOpacity
          className="bg-primary-600 py-4 rounded-full flex-row justify-center items-center mb-6 shadow-sm shadow-primary-500"
          onPress={handleSendOtp}
        >
          <Send color="white" size={20} className="mr-2" />
          <Text className="text-white font-roboto font-bold text-lg">Send OTP</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-2">
          <Text className="text-gray-500 font-roboto">Remember password? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-primary-600 font-roboto font-bold">Back to login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}