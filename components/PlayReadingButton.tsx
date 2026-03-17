import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useSelector } from 'react-redux';

import { RootState } from '../store';

interface PlayReadingButtonProps {
  isPlaying: boolean;
  playSound: () => void;
  stopSound: () => void;
  isLoading: boolean;
  size?: number;
}

export const PlayReadingButton: React.FC<PlayReadingButtonProps> = ({
  isPlaying,
  playSound,
  stopSound,
  isLoading,
  size = 64,
}) => {
  const { colors } = useSelector((state: RootState) => state.config);
  const buttonSize = moderateScale(size, 0.2);

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          if (!isPlaying) {
            playSound();
          } else {
            stopSound();
          }
        }}
      >
        {isLoading ? (
          <View
            style={{
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.accent,
              elevation: 12,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <ActivityIndicator
              color={colors.bgPrimary}
              size={moderateScale(32, 0.2)}
            />
          </View>
        ) : (
          <>
            {!isPlaying ? (
              <View
                style={{
                  width: buttonSize,
                  height: buttonSize,
                  borderRadius: buttonSize / 2,
                  backgroundColor: colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  elevation: 12,
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  borderWidth: 3,
                  borderColor: `${colors.accent}40`,
                }}
              >
                <Ionicons
                  name="play"
                  size={moderateScale(36, 0.2)}
                  color={colors.bgPrimary}
                  style={{ marginLeft: 4 }}
                />
              </View>
            ) : (
              <View
                style={{
                  width: buttonSize,
                  height: buttonSize,
                  borderRadius: buttonSize / 2,
                  backgroundColor: colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  elevation: 12,
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  borderWidth: 3,
                  borderColor: `${colors.accent}40`,
                }}
              >
                <Ionicons
                  name="stop"
                  size={moderateScale(36, 0.2)}
                  color={colors.bgPrimary}
                />
              </View>
            )}
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PlayReadingButton;
