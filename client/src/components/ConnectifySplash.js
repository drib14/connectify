import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';

const ConnectifySplash = () => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      withTiming(1, { duration: 500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    opacity.value = withTiming(1, { duration: 1000 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <View className="flex-1 bg-primary-50 items-center justify-center">
      <Animated.View style={animatedStyle}>
        <Text className="text-5xl font-roboto text-primary-700 font-bold tracking-widest">
          Connectify
        </Text>
      </Animated.View>
    </View>
  );
};

export default ConnectifySplash;