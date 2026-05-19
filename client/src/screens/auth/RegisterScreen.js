import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, UserPlus } from 'lucide-react-native';
import api from '../../utils/api';
import { ScreenSkeleton } from '../../components/Skeletons';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        firstName, lastName, email, password
      });
      Alert.alert('Success', response.data.message, [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ScreenSkeleton />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
        <View className="items-center mb-8">
          <Text className="text-3xl font-roboto text-primary-700 font-bold">Create Account</Text>
          <Text className="text-gray-500 mt-2 font-roboto text-center">
            Join Connectify and start connecting with others.
          </Text>
        </View>

        <View className="space-y-4">
          <View className="flex-row items-center bg-primary-50 rounded-xl px-4 py-3 border border-primary-100 mb-4">
            <User color="#7e22ce" size={20} />
            <TextInput
              className="flex-1 ml-3 font-roboto text-gray-800 text-base"
              placeholder="First Name"
              placeholderTextColor="#9ca3af"
              value={formData.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
            />
          </View>

          <View className="flex-row items-center bg-primary-50 rounded-xl px-4 py-3 border border-primary-100 mb-4">
            <User color="#7e22ce" size={20} />
            <TextInput
              className="flex-1 ml-3 font-roboto text-gray-800 text-base"
              placeholder="Last Name"
              placeholderTextColor="#9ca3af"
              value={formData.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
            />
          </View>

          <View className="flex-row items-center bg-primary-50 rounded-xl px-4 py-3 border border-primary-100 mb-4">
            <Mail color="#7e22ce" size={20} />
            <TextInput
              className="flex-1 ml-3 font-roboto text-gray-800 text-base"
              placeholder="Email Address"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
            />
          </View>

          <View className="flex-row items-center bg-primary-50 rounded-xl px-4 py-3 border border-primary-100 mb-4">
            <Lock color="#7e22ce" size={20} />
            <TextInput
              className="flex-1 ml-3 font-roboto text-gray-800 text-base"
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
            />
          </View>

          <View className="flex-row items-center bg-primary-50 rounded-xl px-4 py-3 border border-primary-100 mb-8">
            <Lock color="#7e22ce" size={20} />
            <TextInput
              className="flex-1 ml-3 font-roboto text-gray-800 text-base"
              placeholder="Confirm Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
            />
          </View>

          <TouchableOpacity
            className="bg-primary-600 py-4 rounded-full flex-row justify-center items-center mb-4 shadow-sm shadow-primary-500"
            onPress={handleRegister}
          >
            <UserPlus color="white" size={20} className="mr-2" />
            <Text className="text-white font-roboto font-bold text-lg">Register</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500 font-roboto">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-primary-600 font-roboto font-bold">Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}