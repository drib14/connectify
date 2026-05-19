import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import useAuthStore from '../store/useAuthStore';

export default function AppNavigator() {
  const { logout, user } = useAuthStore();

  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <Text className="text-2xl font-roboto text-primary-700 font-bold mb-4">
        Welcome to Connectify
      </Text>
      <Text className="text-lg text-gray-700 mb-8">
        Hello, {user?.firstName} {user?.lastName}!
      </Text>

      <TouchableOpacity
        className="w-full bg-primary-600 p-4 rounded-full items-center"
        onPress={logout}
      >
        <Text className="text-white font-bold text-lg font-roboto">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}