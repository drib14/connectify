import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import api from '../../utils/api';

export default function VerifyEmailScreen({ route, navigation }) {
  const { token } = route.params;
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await api.get(`/auth/verify/${token}`);
      setStatus('success');
      setMessage(response.data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
      {status === 'verifying' && (
        <View className="items-center">
          <ActivityIndicator size="large" color="#7e22ce" />
          <Text className="text-gray-600 mt-4 font-roboto text-lg">Verifying your email...</Text>
        </View>
      )}

      {status === 'success' && (
        <View className="items-center">
          <CheckCircle2 color="#16a34a" size={80} className="mb-6" />
          <Text className="text-2xl font-roboto font-bold text-gray-800 mb-2">Email Verified!</Text>
          <Text className="text-gray-500 text-center mb-8">{message}</Text>

          <TouchableOpacity
            className="bg-primary-600 py-3 px-8 rounded-full"
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-white font-roboto font-bold text-lg">Go to Login</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'error' && (
        <View className="items-center">
          <XCircle color="#ef4444" size={80} className="mb-6" />
          <Text className="text-2xl font-roboto font-bold text-gray-800 mb-2">Verification Failed</Text>
          <Text className="text-gray-500 text-center mb-8">{message}</Text>

          <TouchableOpacity
            className="bg-primary-600 py-3 px-8 rounded-full"
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-white font-roboto font-bold text-lg">Back to Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}