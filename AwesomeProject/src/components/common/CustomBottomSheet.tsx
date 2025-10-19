import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';

const { height } = Dimensions.get('window');
const SHEET_HEIGHT = height * 0.5; // 50% of screen height

interface CustomBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  isVisible,
  onClose,
  children,
}) => {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const animateOpen = useCallback(() => {
    Animated.spring(translateY, {
      toValue: 0,
      damping: 15,
      stiffness: 150,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  const animateClose = useCallback(() => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [translateY, onClose]);

  useEffect(() => {
    if (isVisible) {
      animateOpen();
    } else {
      animateClose();
    }
  }, [isVisible, animateOpen, animateClose]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        if (gestureState.dy > 50) {
          animateClose();
        } else {
          animateOpen();
        }
      },
    })
  ).current;

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={animateClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: translateY }] },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SHEET_HEIGHT,
    width: '100%',
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    marginBottom: 10,
  },
});
