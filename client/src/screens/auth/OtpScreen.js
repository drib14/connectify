import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2 } from 'lucide-react-native';
import api from '../../utils/api';
import { ScreenSkeleton } from '../../components/Skeletons';

export default function OtpScreen({ route, navigation }) {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      Alert.alert('Error', 'Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp: otpString });
      navigation.navigate('ResetPassword', { email, otp: otpString });
    } catch (error) {
      Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ScreenSkeleton />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-6 justify-center">
        <View className="items-center mb-8">
          <Text className="text-3xl font-roboto text-primary-700 font-bold">Verification</Text>
          <Text className="text-gray-500 mt-2 font-roboto text-center">
            Enter the 6-digit verification code sent to {email}
          </Text>
        </View>

        <View className="flex-row justify-between mb-10 px-2">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => inputRefs.current[index] = ref}
              className="w-12 h-14 bg-primary-50 border border-primary-200 rounded-lg text-center text-xl font-bold text-primary-900 shadow-sm"
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          className="bg-primary-600 py-4 rounded-full flex-row justify-center items-center mb-6 shadow-sm shadow-primary-500"
          onPress={handleVerifyOtp}
        >
          <CheckCircle2 color="white" size={20} className="mr-2" />
          <Text className="text-white font-roboto font-bold text-lg">Verify & Proceed</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-2">
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-primary-600 font-roboto font-bold">Back to login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}