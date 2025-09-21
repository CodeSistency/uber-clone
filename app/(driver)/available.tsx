import { Stack, router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";

import { driverDeliveryService } from "@/app/services/driverDeliveryService";
import { driverTransportService } from "@/app/services/driverTransportService";
import { websocketService } from "@/app/services/websocketService";
import CustomButton from "@/components/CustomButton";
import { useUI } from "@/components/UIWrapper";
import { useFetch } from "@/lib/fetch";
import { generateIdempotencyKey } from "@/lib/utils";
import { useRealtimeStore } from "@/store";

type ServiceTab = "transport" | "delivery" | "errand" | "parcel";

const DriverAvailableScreen: React.FC = () => {
  const [tab, setTab] = useState<ServiceTab>("transport");
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"nearest" | "highestFee" | "newest">(
    "nearest",
  );
  const [refreshing, setRefreshing] = useState(false);
  const { showSuccess, showError } = useUI();

  const {
    data: transportList,
    loading: loadingTransport,
    error: errTransport,
    refetch: refetchTransport,
  } = useFetch<any[]>("rides/flow/driver/transport/available", {
    requiresAuth: true,
  } as any);
  const {
    data: deliveryList,
    loading: loadingDelivery,
    error: errDelivery,
    refetch: refetchDelivery,
  } = useFetch<any[]>("rides/flow/driver/delivery/available", {
    requiresAuth: true,
  } as any);
  const {
    data: errandList,
    loading: loadingErrand,
    error: errErrand,
    refetch: refetchErrand,
  } = useFetch<any[]>("rides/flow/driver/errand/available", {
    requiresAuth: true,
  } as any);
  const {
    data: parcelList,
    loading: loadingParcel,
    error: errParcel,
    refetch: refetchParcel,
  } = useFetch<any[]>("rides/flow/driver/parcel/available", {
    requiresAuth: true,
  } as any);
  const driverLoc = useRealtimeStore((s) => s.driverLocation);

  const baseDataset = useMemo(() => {
    if (tab === "transport") return transportList || [];
    if (tab === "delivery") return deliveryList || [];
    if (tab === "errand") return errandList || [];
    return parcelList || [];
  }, [tab, transportList, deliveryList, errandList, parcelList]);

  const haversineKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getPickupCoords = (item: any) => {
    const lat =
      item.originLatitude ??
      item.pickupLatitude ??
      item.store?.latitude ??
      item.origin_latitude ??
      null;
    const lng =
      item.originLongitude ??
      item.pickupLongitude ??
      item.store?.longitude ??
      item.origin_longitude ??
      null;
    return { lat, lng };
  };

  const getFee = (item: any) => {
    return item.estimatedFare ?? item.totalPrice ?? item.price ?? 0;
  };

  const getCreatedAt = (item: any) => {
    return item.createdAt
      ? new Date(item.createdAt).getTime()
      : item.rideId || item.orderId || item.id || 0;
  };

  const dataset = useMemo(() => {
    const arr = [...baseDataset];
    if (sortBy === "nearest" && driverLoc?.latitude && driverLoc?.longitude) {
      arr.sort((a, b) => {
        const ac = getPickupCoords(a);
        const bc = getPickupCoords(b);
        const ad =
          ac.lat && ac.lng
            ? haversineKm(
                driverLoc.latitude,
                driverLoc.longitude,
                ac.lat,
                ac.lng,
              )
            : Number.POSITIVE_INFINITY;
        const bd =
          bc.lat && bc.lng
            ? haversineKm(
                driverLoc.latitude,
                driverLoc.longitude,
                bc.lat,
                bc.lng,
              )
            : Number.POSITIVE_INFINITY;
        return ad - bd;
      });
    } else if (sortBy === "highestFee") {
      arr.sort((a, b) => (getFee(b) as number) - (getFee(a) as number));
    } else if (sortBy === "newest") {
      arr.sort(
        (a, b) => (getCreatedAt(b) as number) - (getCreatedAt(a) as number),
      );
    }
    return arr;
  }, [baseDataset, sortBy, driverLoc?.latitude, driverLoc?.longitude]);

  const handleAccept = async (item: any) => {
    try {
      setAcceptingId((item.rideId || item.orderId) as number);
      const key = generateIdempotencyKey();

      if (tab === "transport") {
        await driverTransportService.accept(item.rideId, key);
        // Persist active ride context
        useRealtimeStore.getState().setActiveRide({
          service: "transport",
          ride_id: item.rideId,
          origin_address: item.originAddress,
          destination_address: item.destinationAddress,
          origin_latitude: item.originLatitude,
          origin_longitude: item.originLongitude,
          destination_latitude: item.destinationLatitude,
          destination_longitude: item.destinationLongitude,
        } as any);
        websocketService.joinRideRoom(item.rideId);
        showSuccess("Aceptado", "Viaje asignado");
        router.replace("/(root)/driver-unified-flow-demo" as any);
      } else if (tab === "delivery") {
        await driverDeliveryService.accept(item.orderId, key);
        useRealtimeStore.getState().setActiveRide({
          service: "delivery",
          orderId: item.orderId,
          deliveryAddress: item.deliveryAddress,
          deliveryLatitude: item.deliveryLatitude,
          deliveryLongitude: item.deliveryLongitude,
        } as any);
        websocketService.joinRideRoom(item.orderId);
        showSuccess("Aceptado", "Pedido asignado");
        router.replace("/(root)/driver-unified-flow-demo" as any);
      } else if (tab === "errand") {
        await (
          await import("@/app/services/driverErrandService")
        ).driverErrandService.accept(item.id, key);
        useRealtimeStore
          .getState()
          .setActiveRide({ service: "mandado", id: item.id } as any);
        websocketService.joinRideRoom(item.id);
        showSuccess("Aceptado", "Mandado asignado");
        router.replace("/(root)/driver-unified-flow-demo" as any);
      } else {
        await (
          await import("@/app/services/driverParcelService")
        ).driverParcelService.accept(item.id, key);
        useRealtimeStore
          .getState()
          .setActiveRide({ service: "envio", id: item.id } as any);
        websocketService.joinRideRoom(item.id);
        showSuccess("Aceptado", "Envío asignado");
        router.replace("/(root)/driver-unified-flow-demo" as any);
      }
    } catch (e: any) {
      showError("Error", e?.message || "No se pudo aceptar");
    } finally {
      setAcceptingId(null);
    }
  };

  const loading =
    tab === "transport"
      ? loadingTransport
      : tab === "delivery"
        ? loadingDelivery
        : tab === "errand"
          ? loadingErrand
          : loadingParcel;
  const error =
    tab === "transport"
      ? errTransport
      : tab === "delivery"
        ? errDelivery
        : tab === "errand"
          ? errErrand
          : errParcel;
  const refetch =
    tab === "transport"
      ? refetchTransport
      : tab === "delivery"
        ? refetchDelivery
        : tab === "errand"
          ? refetchErrand
          : refetchParcel;

  const refetchCurrent = async () => {
    const fn =
      tab === "transport"
        ? refetchTransport
        : tab === "delivery"
          ? refetchDelivery
          : tab === "errand"
            ? refetchErrand
            : refetchParcel;
    await fn();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchCurrent();
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const id = item.rideId || item.orderId || item.id;
    return (
      <View className="mb-3 p-4 bg-white rounded-lg border border-gray-100">
        <Text className="font-JakartaBold text-base mb-1">
          #{id} •{" "}
          {tab === "transport"
            ? "Transporte"
            : tab === "delivery"
              ? "Delivery"
              : tab === "errand"
                ? "Mandado"
                : "Envío"}
        </Text>
        <Text className="text-sm text-gray-700">
          Origen:{" "}
          {item.originAddress || item.pickupAddress || item.store?.name || "—"}
        </Text>
        <Text className="text-sm text-gray-700 mb-3">
          Destino:{" "}
          {item.destinationAddress ||
            item.dropoffAddress ||
            item.deliveryAddress ||
            "—"}
        </Text>
        <CustomButton
          title={acceptingId === id ? "Aceptando..." : "Aceptar"}
          bgVariant="primary"
          onPress={() => handleAccept(item)}
          disabled={acceptingId === id}
        />
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, title: "Disponibles (Conductor)" }}
      />
      <View className="flex-1 p-4">
        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg mr-2 ${tab === "transport" ? "bg-primary" : "bg-gray-200"}`}
            onPress={() => setTab("transport")}
          >
            <Text
              className={`text-center font-JakartaBold ${tab === "transport" ? "text-white" : "text-gray-700"}`}
            >
              Transporte
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ml-2 ${tab === "delivery" ? "bg-primary" : "bg-gray-200"}`}
            onPress={() => setTab("delivery")}
          >
            <Text
              className={`text-center font-JakartaBold ${tab === "delivery" ? "text-white" : "text-gray-700"}`}
            >
              Delivery
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg mr-2 ${tab === "errand" ? "bg-primary" : "bg-gray-200"}`}
            onPress={() => setTab("errand")}
          >
            <Text
              className={`text-center font-JakartaBold ${tab === "errand" ? "text-white" : "text-gray-700"}`}
            >
              Mandado
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ml-2 ${tab === "parcel" ? "bg-primary" : "bg-gray-200"}`}
            onPress={() => setTab("parcel")}
          >
            <Text
              className={`text-center font-JakartaBold ${tab === "parcel" ? "text-white" : "text-gray-700"}`}
            >
              Envío
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row mb-2">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg mr-2 ${sortBy === "nearest" ? "bg-primary" : "bg-gray-200"}`}
            onPress={() => setSortBy("nearest")}
          >
            <Text
              className={`text-center font-JakartaBold ${sortBy === "nearest" ? "text-white" : "text-gray-700"}`}
            >
              Más cerca
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg mx-1 ${sortBy === "highestFee" ? "bg-primary" : "bg-gray-200"}`}
            onPress={() => setSortBy("highestFee")}
          >
            <Text
              className={`text-center font-JakartaBold ${sortBy === "highestFee" ? "text-white" : "text-gray-700"}`}
            >
              Mayor tarifa
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg ml-2 ${sortBy === "newest" ? "bg-primary" : "bg-gray-200"}`}
            onPress={() => setSortBy("newest")}
          >
            <Text
              className={`text-center font-JakartaBold ${sortBy === "newest" ? "text-white" : "text-gray-700"}`}
            >
              Más nuevo
            </Text>
          </TouchableOpacity>
        </View>

        {(tab === "transport"
          ? loadingTransport
          : tab === "delivery"
            ? loadingDelivery
            : tab === "errand"
              ? loadingErrand
              : loadingParcel) && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" />
          </View>
        )}

        {(tab === "transport"
          ? errTransport
          : tab === "delivery"
            ? errDelivery
            : tab === "errand"
              ? errErrand
              : errParcel) && (
          <View className="items-center justify-center py-8">
            <Text className="text-red-500 mb-3">
              {tab === "transport"
                ? errTransport
                : tab === "delivery"
                  ? errDelivery
                  : tab === "errand"
                    ? errErrand
                    : errParcel}
            </Text>
            <CustomButton
              title="Reintentar"
              bgVariant="primary"
              onPress={
                tab === "transport"
                  ? refetchTransport
                  : tab === "delivery"
                    ? refetchDelivery
                    : tab === "errand"
                      ? refetchErrand
                      : refetchParcel
              }
            />
          </View>
        )}

        {!(tab === "transport"
          ? loadingTransport
          : tab === "delivery"
            ? loadingDelivery
            : tab === "errand"
              ? loadingErrand
              : loadingParcel) &&
          !(tab === "transport"
            ? errTransport
            : tab === "delivery"
              ? errDelivery
              : tab === "errand"
                ? errErrand
                : errParcel) && (
            <FlatList
              data={dataset}
              keyExtractor={(item: any) =>
                String(item.rideId || item.orderId || item.id)
              }
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 24 }}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          )}
      </View>
    </>
  );
};

export default DriverAvailableScreen;
