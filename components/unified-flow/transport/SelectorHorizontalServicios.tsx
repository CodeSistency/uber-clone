import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";

import TransportVehicleCard from "./TransportVehicleCard";

type SelectorHorizontalServiciosProps<T extends { id: number }> = {
  data: T[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  renderName: (item: T) => string;
  renderVehicleTypeName: (item: T) => string;
  renderIcon: (item: T) => string;
  renderBaseFare: (item: T) => number;
  renderPerMinuteRate: (item: T) => number;
  renderPerMileRate: (item: T) => number;
  renderRating?: (item: T) => number | undefined;
  renderETA?: (item: T) => number | undefined;
  onVisibleChange?: (id: number) => void;
};

type ItemLayout = {
  id: number;
  x: number;
  width: number;
};

const inertiaThreshold = 32;

const SelectorHorizontalServicios = <T extends { id: number }>({
  data,
  selectedId,
  onSelect,
  renderName,
  renderVehicleTypeName,
  renderIcon,
  renderBaseFare,
  renderPerMinuteRate,
  renderPerMileRate,
  renderRating,
  renderETA,
  onVisibleChange,
}: SelectorHorizontalServiciosProps<T>) => {
  const scrollRef = useRef<ScrollView>(null);
  const itemLayouts = useRef<ItemLayout[]>([]);
  const [internalSelection, setInternalSelection] = useState<number | null>(
    null,
  );
  const [autoScrolling, setAutoScrolling] = useState(false);

  const targetId = selectedId ?? internalSelection;

  const updateLayout = useCallback((id: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    const layouts = itemLayouts.current.filter((layout) => layout.id !== id);
    itemLayouts.current = [...layouts, { id, x, width }];
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (autoScrolling) return;

      const { contentOffset, layoutMeasurement } = event.nativeEvent;
      const scrollX = contentOffset.x + layoutMeasurement.width * 0.5;

      const layouts = itemLayouts.current;
      if (!layouts.length) {
        return;
      }

      let closest: ItemLayout | null = null;
      let minDistance = Number.MAX_SAFE_INTEGER;

      for (const layout of layouts) {
        const center = layout.x + layout.width / 2;
        const distance = Math.abs(center - scrollX);
        if (distance < minDistance) {
          closest = layout;
          minDistance = distance;
        }
      }

      if (!closest) return;

      if (minDistance <= inertiaThreshold && closest.id !== targetId) {
        setInternalSelection(closest.id);
        onVisibleChange?.(closest.id);
      }
    },
    [autoScrolling, onVisibleChange, targetId],
  );

  const scrollToId = useCallback((id: number) => {
    const layout = itemLayouts.current.find((entry) => entry.id === id);
    if (!layout) return;

    const offset = Math.max(layout.x - 16, 0);
    setAutoScrolling(true);
    scrollRef.current?.scrollTo({ x: offset, animated: true });
    setTimeout(() => setAutoScrolling(false), 320);
  }, []);

  const handleSelect = useCallback(
    (id: number) => {
      setInternalSelection(id);
      onSelect(id);
      scrollToId(id);
    },
    [onSelect, scrollToId],
  );

  useEffect(() => {
    if (targetId == null && data.length) {
      const firstId = data[0].id;
      setInternalSelection(firstId);
      onSelect(firstId);
      scrollToId(firstId);
    }
  }, [data, onSelect, scrollToId, targetId]);

  useEffect(() => {
    if (selectedId != null) {
      setInternalSelection(selectedId);
      scrollToId(selectedId);
    }
  }, [scrollToId, selectedId]);

  const memoisedData = useMemo(() => data, [data]);

  return (
    <View className="mt-5">
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          columnGap: 20,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {memoisedData.map((item, index) => {
          const id = item.id;
          const name = renderName(item);
          const vehicleTypeName = renderVehicleTypeName(item);
          const icon = renderIcon(item);
          const baseFare = renderBaseFare(item);
          const perMinuteRate = renderPerMinuteRate(item);
          const perMileRate = renderPerMileRate(item);
          const rating = renderRating?.(item);
          const eta = renderETA?.(item);
          const isActive = targetId === id;

          return (
            <TransportVehicleCard
              key={id}
              id={id}
              name={name}
              vehicleTypeName={vehicleTypeName}
              icon={icon}
              baseFare={baseFare}
              perMinuteRate={perMinuteRate}
              perMileRate={perMileRate}
              rating={rating}
              etaMinutes={eta}
              isActive={!!isActive}
              onPress={handleSelect}
              delay={index * 80}
              accessibilityLabel={`${name} ${vehicleTypeName}`}
              onLayout={(event) => updateLayout(id, event)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

export type { SelectorHorizontalServiciosProps };
export default SelectorHorizontalServicios;
