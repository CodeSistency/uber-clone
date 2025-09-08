import React, { useEffect, useRef } from 'react';
import { Animated, PanResponder, ViewProps, View, Text, TouchableOpacity } from 'react-native';

interface InlineBottomSheetProps extends ViewProps {
  visible: boolean;
  minHeight?: number;
  maxHeight?: number;
  initialHeight?: number;
  allowDrag?: boolean;
  showHandle?: boolean;
  onClose?: () => void;
  snapPoints?: number[];
  className?: string;
}

const InlineBottomSheet: React.FC<InlineBottomSheetProps> = ({
  visible,
  minHeight = 120,
  maxHeight = 600,
  initialHeight = 300,
  allowDrag = true,
  showHandle = true,
  onClose,
  snapPoints,
  className = '',
  children,
  ...props
}) => {
  console.log('[InlineBottomSheet] ===== COMPONENT MOUNTED =====');
  console.log('[InlineBottomSheet] Received props:', {
    visible,
    minHeight,
    maxHeight,
    initialHeight,
    allowDrag,
    showHandle,
    snapPoints,
    className,
    hasChildren: !!children,
    extraProps: Object.keys(props).length > 0 ? props : 'none'
  });
  const heightAnim = useRef(new Animated.Value(initialHeight)).current;
  const startHeightRef = useRef(initialHeight);
  const currentHeightRef = useRef(initialHeight);

  useEffect(() => {
    console.log('[InlineBottomSheet] Setting up height listener');
    const id = heightAnim.addListener(({ value }) => {
      currentHeightRef.current = value;
      console.log('[InlineBottomSheet] Height changed to:', value);
    });
    return () => {
      console.log('[InlineBottomSheet] Removing height listener');
      heightAnim.removeListener(id);
    };
  }, [heightAnim]);

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const animateTo = (toValue: number) => {
    Animated.spring(heightAnim, {
      toValue,
      useNativeDriver: false,
      bounciness: 0,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => allowDrag && Math.abs(g.dy) > 6,
      onPanResponderGrant: () => {
        startHeightRef.current = currentHeightRef.current;
      },
      onPanResponderMove: (_, g) => {
        if (!allowDrag) return;
        const next = clamp(startHeightRef.current - g.dy, minHeight, maxHeight);
        heightAnim.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        if (!allowDrag) return;
        const end = clamp(startHeightRef.current - g.dy, minHeight, maxHeight);
        const mid = (minHeight + maxHeight) / 2;
        const snaps = [minHeight, mid, maxHeight, ...(snapPoints || [])];
        const nearest = snaps.reduce((a, b) => (Math.abs(b - end) < Math.abs(a - end) ? b : a));
        animateTo(nearest);
      },
    })
  ).current;

  console.log('[InlineBottomSheet] ===== RENDERING =====');
  console.log('[InlineBottomSheet] visible:', visible);
  console.log('[InlineBottomSheet] currentHeightRef.current:', currentHeightRef.current);

  if (!visible) {
    console.log('[InlineBottomSheet] NOT RENDERING - visible is false');
    return null;
  }

  return (
    <View className={`absolute left-0 right-0 bottom-0 ${className}`}>
      <Animated.View
        style={{ height: heightAnim }}
        className="rounded-t-3xl overflow-hidden shadow-2xl bg-white dark:bg-brand-primary"
      >
        {/* Drag handle */}
        {showHandle && (
          <View
            {...(allowDrag ? panResponder.panHandlers : {})}
            className="items-center pt-2 pb-1"
          >
            <View className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500" />
          </View>
        )}

        {/* Content */}
        <View className="flex-1 overflow-hidden">
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

// Test component to verify drag functionality
export const TestInlineBottomSheet: React.FC = () => {
  const [visible, setVisible] = React.useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: 'lightblue' }}>
      <InlineBottomSheet
        visible={visible}
        minHeight={120}
        maxHeight={400}
        initialHeight={200}
        allowDrag={true}
        showHandle={true}
        className="bg-white"
      >
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Test Bottom Sheet
          </Text>
          <Text style={{ fontSize: 14, color: 'gray' }}>
            Drag this sheet up and down to test functionality
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: 'blue', padding: 10, marginTop: 20, borderRadius: 5 }}
            onPress={() => setVisible(!visible)}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              {visible ? 'Hide' : 'Show'} Sheet
            </Text>
          </TouchableOpacity>
        </View>
      </InlineBottomSheet>
    </View>
  );
};

export default InlineBottomSheet;


