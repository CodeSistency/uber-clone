import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, PanResponder, View, Text, TouchableOpacity, ViewProps } from 'react-native';

export interface BottomSheetProps extends ViewProps {
  visible: boolean;
  onClose?: () => void;
  allowDrag?: boolean;           // allow user drag down to close
  backdropClose?: boolean;       // tap outside to close
  lock?: boolean;                // prevent closing by any user action
  minHeight?: number;            // pixels
  maxHeight?: number;            // pixels
  initialHeight?: number;        // starting height
  snapPoints?: number[];         // list of snap heights
  header?: React.ReactNode;
  footer?: React.ReactNode;
  showHandle?: boolean;
  className?: string;            // content container styles
  backdropClassName?: string;    // backdrop styles
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  allowDrag = true,
  backdropClose = true,
  lock = false,
  minHeight = 120,
  maxHeight = 600,
  initialHeight = 300,
  snapPoints = [],
  header,
  footer,
  showHandle = true,
  className = '',
  backdropClassName = '',
  children,
  ...props
}) => {
  const translateY = useRef(new Animated.Value(maxHeight)).current;

  const open = () => {
    Animated.timing(translateY, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };
  const close = () => {
    if (lock) return; // prevent close when locked
    Animated.timing(translateY, { toValue: maxHeight, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => onClose?.());
  };

  useEffect(() => { if (visible) open(); }, [visible]);

  const pan = useRef(new Animated.Value(0)).current;
  const responder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: () => allowDrag && !lock,
    onPanResponderMove: Animated.event([null, { dy: pan }], { useNativeDriver: false }),
    onPanResponderRelease: (_, { dy, vy }) => {
      if (!allowDrag || lock) return;
      const threshold = 80;
      // snap or close
      if (dy > threshold || vy > 0.75) {
        close();
        return;
      }
      // Snap to nearest point
      const current = Math.max(minHeight, Math.min(initialHeight + dy, maxHeight));
      const all = [minHeight, ...snapPoints, initialHeight];
      const nearest = all.reduce((p, c) => Math.abs(c - current) < Math.abs(p - current) ? c : p, all[0]);
      Animated.timing(translateY, { toValue: maxHeight - nearest, duration: 180, useNativeDriver: true }).start();
      pan.setValue(0);
    }
  })).current;

  const contentHeight = Math.max(minHeight, Math.min(initialHeight, maxHeight));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => { if (backdropClose && !lock) close(); }}
        className={`flex-1 bg-black/50 ${backdropClassName}`}
      />
      <Animated.View
        {...(allowDrag && !lock ? responder.panHandlers : {})}
        className={`rounded-t-3xl bg-white dark:bg-brand-primary ${className}`}
        style={{ transform: [{ translateY }], maxHeight, minHeight }}
        {...props}
      >
        {showHandle && (
          <View className="items-center py-2">
            <View className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </View>
        )}
        {header}
        <View className="px-5 pb-5">{children}</View>
        {footer}
      </Animated.View>
    </Modal>
  );
};

export default BottomSheet;


