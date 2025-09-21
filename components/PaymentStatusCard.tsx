import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { icons } from "@/constants";

import { usePaymentStore } from "@/store";
import { paymentUtils } from "@/app/services/paymentService";

interface PaymentStatusCardProps {
  serviceId: number;
  serviceType: "ride" | "delivery" | "errand" | "parcel";
  onViewDetails?: () => void;
  className?: string;
}

const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({
  serviceId,
  serviceType,
  onViewDetails,
  className = ""
}) => {
  const paymentStore = usePaymentStore();

  // Buscar grupo de pagos activo para este servicio
  const paymentGroup = paymentStore.getActiveGroup(serviceId, serviceType);

  if (!paymentGroup) {
    return null; // No hay pagos activos para este servicio
  }

  const getStatusIcon = () => {
    switch (paymentGroup.status) {
      case "completed":
        return <Text className="text-green-500">✓</Text>;
      case "active":
        return <Image source={icons.point} className="w-5 h-5" style={{ tintColor: "#F59E0B" }} />;
      case "cancelled":
        return <Text className="text-red-500">✗</Text>;
      case "expired":
        return <Text className="text-gray-500">⚠️</Text>;
      default:
        return <Image source={icons.point} className="w-5 h-5" style={{ tintColor: "#6B7280" }} />;
    }
  };

  const getStatusText = () => {
    switch (paymentGroup.status) {
      case "completed":
        return "Completado";
      case "active":
        return "En proceso";
      case "cancelled":
        return "Cancelado";
      case "expired":
        return "Expirado";
      default:
        return "Desconocido";
    }
  };

  const getStatusColor = () => {
    switch (paymentGroup.status) {
      case "completed":
        return "text-green-700 dark:text-green-300";
      case "active":
        return "text-yellow-700 dark:text-yellow-300";
      case "cancelled":
        return "text-red-700 dark:text-red-300";
      case "expired":
        return "text-gray-700 dark:text-gray-300";
      default:
        return "text-gray-700 dark:text-gray-300";
    }
  };

  const pendingPayments = paymentGroup.payments.filter(p =>
    p.status === "pending" || p.status === "pending_reference"
  ).length;

  return (
    <View className={`bg-white dark:bg-brand-primaryDark rounded-xl p-4 border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Image source={icons.dollar} className="w-5 h-5" />
          <Text className="text-lg font-JakartaBold text-gray-800 dark:text-white ml-2">
            Estado de Pagos
          </Text>
        </View>
        {getStatusIcon()}
      </View>

      {/* Información principal */}
      <View className="mb-3">
        <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Grupo: {paymentGroup.groupId.slice(-8)}
        </Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          {paymentGroup.payments.length} método{paymentGroup.payments.length !== 1 ? 's' : ''} de pago
        </Text>
      </View>

      {/* Barra de progreso */}
      <View className="mb-3">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-JakartaMedium text-gray-700 dark:text-gray-300">
            Progreso
          </Text>
          <Text className="text-sm font-JakartaBold text-primary">
            {paymentGroup.progress}%
          </Text>
        </View>
        <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <View
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-full h-2"
            style={{ width: `${Math.min(paymentGroup.progress, 100)}%` }}
          />
        </View>
      </View>

      {/* Estado y montos */}
      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text className={`text-sm font-JakartaMedium ${getStatusColor()}`}>
            {getStatusText()}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            ${paymentGroup.confirmedAmount.toFixed(2)} de ${paymentGroup.totalAmount.toFixed(2)}
          </Text>
        </View>

        {pendingPayments > 0 && (
          <View className="bg-orange-100 dark:bg-orange-900/20 rounded-lg px-3 py-1">
            <Text className="text-xs font-JakartaMedium text-orange-700 dark:text-orange-300">
              {pendingPayments} pendiente{pendingPayments !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Botón de detalles */}
      {onViewDetails && (
        <TouchableOpacity
          onPress={onViewDetails}
          className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 items-center"
        >
          <Text className="text-sm font-JakartaMedium text-primary">
            Ver detalles de pagos
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PaymentStatusCard;
