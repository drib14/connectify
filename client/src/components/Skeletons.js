import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

export const SkeletonBox = ({ width, height, rounded = 'rounded-md', className = '' }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={`bg-primary-200 ${rounded} ${className}`}
      style={[{ width, height }, animatedStyle]}
    />
  );
};

export const ScreenSkeleton = () => {
  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <View className="items-center mb-10">
        <SkeletonBox width={150} height={40} rounded="rounded-lg" />
      </View>

      <View className="space-y-4 mb-6">
        <SkeletonBox width="100%" height={50} rounded="rounded-xl" className="mb-4" />
        <SkeletonBox width="100%" height={50} rounded="rounded-xl" className="mb-4" />
        <SkeletonBox width="100%" height={50} rounded="rounded-xl" className="mb-6" />
      </View>

      <SkeletonBox width="100%" height={50} rounded="rounded-full" className="mb-6" />

      <View className="items-center">
        <SkeletonBox width={100} height={20} />
      </View>
    </View>
  );
};