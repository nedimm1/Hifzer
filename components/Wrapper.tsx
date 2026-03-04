import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { spacing } from '../constants/spacing';

type PaddingVariant = 'none' | 'compact' | 'comfortable' | 'default';

interface Colors {
  bgPrimary: string;
}

interface WrapperProps {
  children: React.ReactNode;
  colors: Colors;
  padding?: PaddingVariant;
  style?: ViewStyle;
}

const Wrapper: React.FC<WrapperProps> = ({
  children,
  colors,
  padding = 'default',
  style,
}) => {
  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return { paddingVertical: 0, paddingHorizontal: 0 };
      case 'compact':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
        };
      case 'comfortable':
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
        };
      default:
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        };
    }
  };

  return (
    <View
      style={[
        styles.body,
        { backgroundColor: colors.bgPrimary },
        getPaddingStyle(),
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
});

export default Wrapper;
