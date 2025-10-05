import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";

import { useUI } from "@/components/UIWrapper";
import { icons } from "@/constants";
import { SplitPayment } from "@/lib/paymentValidation";

interface MultiplePaymentProgressProps {
  payments: SplitPayment[];
  onPaymentSelect?: (payment: SplitPayment) => void;
  onCopyReference?: (reference: string) => void;
  className?: string;
}

const MultiplePaymentProgress: React.FC<MultiplePaymentProgressProps> = ({
  payments,
  onPaymentSelect,
  onCopyReference,
  className = "",
}) => {
  const { showSuccess } = useUI();

  const getStatusIcon = (status: SplitPayment["status"]) => {
    switch (status) {
      case "confirmed":
        return <Text className="text-green-500">✓</Text>;
      case "pending":
        return (
          <Image
            source={icons.point}
            className="w-5 h-5"
            style={{ tintColor: "#F59E0B" }}
          />
        );
      case "cancelled":
        return <Text className="text-red-500">✗</Text>;
      default:
        return (
          <Image
            source={icons.point}
            className="w-5 h-5"
            style={{ tintColor: "#6B7280" }}
          />
        );
    }
  };

  const getStatusText = (status: SplitPayment["status"]) => {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "pending":
        return "Pendiente";
      case "cancelled":
        return "Cancelado";
      default:
        return "Desconocido";
    }
  };

  const getStatusColor = (status: SplitPayment["status"]) => {
    switch (status) {
      case "confirmed":
        return "text-green-700 dark:text-green-300";
      case "pending":
        return "text-yellow-700 dark:text-yellow-300";
      case "cancelled":
        return "text-red-700 dark:text-red-300";
      default:
        return "text-gray-700 dark:text-gray-300";
    }
  };

  const getPaymentIcon = (method: SplitPayment["method"]) => {
    switch (method) {
      case "cash":
        return "💵";
      case "card":
        return "💳";
      case "wallet":
        return "📱";
      default:
        return "💰";
    }
  };

  const handleCopyReference = async (reference: string) => {
    // En una app real, usaríamos Clipboard
    
    showSuccess("Copiado", "Referencia copiada al portapapeles");
    onCopyReference?.(reference);
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const confirmedAmount = payments
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0);
  const progressPercentage =
    totalAmount > 0 ? (confirmedAmount / totalAmount) * 100 : 0;

  return (
    <View
      className={`bg-white dark:bg-brand-primaryDark rounded-xl p-6 ${className}`}
    >
      {/* Header con progreso general */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-JakartaBold text-gray-800 dark:text-white">
            Estado de Pagos
          </Text>
          <Text className="text-sm font-JakartaMedium text-gray-600 dark:text-gray-400">
            {payments.filter((p) => p.status === "confirmed").length} de{" "}
            {payments.length} completados
          </Text>
        </View>

        {/* Barra de progreso */}
        <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
          <View
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-full h-3"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-sm font-JakartaMedium text-gray-600 dark:text-gray-400">
            ${confirmedAmount.toFixed(2)} de ${totalAmount.toFixed(2)}
          </Text>
          <Text className="text-sm font-JakartaBold text-green-600">
            {progressPercentage.toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Lista de pagos */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {payments.map((payment, index) => (
          <TouchableOpacity
            key={payment.id}
            onPress={() => onPaymentSelect?.(payment)}
            className={`rounded-lg p-4 mb-3 border-2 ${
              payment.status === "confirmed"
                ? "border-green-200 bg-green-50 dark:bg-green-900/20"
                : payment.status === "pending"
                  ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20"
                  : "border-red-200 bg-red-50 dark:bg-red-900/20"
            }`}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">
                  {getPaymentIcon(payment.method)}
                </Text>
                <View>
                  <Text className="font-JakartaMedium text-gray-800 dark:text-white">
                    ${payment.amount.toFixed(2)}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    {payment.percentage.toFixed(1)}% del total
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                {getStatusIcon(payment.status)}
                <Text
                  className={`text-sm font-JakartaMedium ml-2 ${getStatusColor(payment.status)}`}
                >
                  {getStatusText(payment.status)}
                </Text>
              </View>
            </View>

            <View className="mb-3">
              <Text className="text-sm font-JakartaMedium text-gray-700 dark:text-gray-300 mb-1">
                {payment.description}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Método:{" "}
                {payment.method === "cash"
                  ? "Efectivo"
                  : payment.method === "card"
                    ? "Tarjeta/Transferencia"
                    : "Digital"}
              </Text>
            </View>

            {/* Referencia bancaria (solo para métodos electrónicos) */}
            {payment.reference && payment.method !== "cash" && (
              <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-JakartaMedium text-blue-700 dark:text-blue-300">
                    📋 Referencia bancaria
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleCopyReference(payment.reference!)}
                    className="flex-row items-center bg-blue-100 dark:bg-blue-800 rounded-lg px-3 py-1"
                  >
                    <Text className="text-blue-500">📋</Text>
                    <Text className="text-sm font-JakartaMedium text-blue-700 dark:text-blue-300 ml-1">
                      Copiar
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-sm font-mono text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-800 px-3 py-2 rounded-lg">
                  {payment.reference}
                </Text>
                <Text className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  ⚠️ Válida por 24 horas
                </Text>
              </View>
            )}

            {/* Instrucciones por método de pago */}
            {payment.method === "cash" && payment.status === "pending" && (
              <View className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                <Text className="text-sm font-JakartaMedium text-orange-700 dark:text-orange-300 mb-1">
                  💰 Pago en efectivo
                </Text>
                <Text className="text-xs text-orange-600 dark:text-orange-400">
                  El conductor te indicará cómo realizar el pago al llegar
                </Text>
              </View>
            )}

            {payment.method === "card" && payment.status === "pending" && (
              <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <Text className="text-sm font-JakartaMedium text-blue-700 dark:text-blue-300 mb-1">
                  💳 Transferencia bancaria
                </Text>
                <Text className="text-xs text-blue-600 dark:text-blue-400">
                  Realiza la transferencia usando la referencia bancaria
                </Text>
              </View>
            )}

            {payment.method === "wallet" && payment.status === "pending" && (
              <View className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <Text className="text-sm font-JakartaMedium text-purple-700 dark:text-purple-300 mb-1">
                  📱 Pago móvil/digital
                </Text>
                <Text className="text-xs text-purple-600 dark:text-purple-400">
                  Usa la referencia para completar el pago digital
                </Text>
              </View>
            )}

            {/* Botón para marcar como completado (solo para testing) */}
            {payment.status === "pending" && (
              <TouchableOpacity
                onPress={() => {
                  // En una app real, esto se haría automáticamente cuando se confirme el pago
                  
                }}
                className="bg-green-500 rounded-lg p-3 mt-3"
              >
                <Text className="text-white font-JakartaMedium text-center text-sm">
                  ✅ Marcar como pagado
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Resumen final */}
      {payments.length > 0 && (
        <View className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Text className="text-sm font-JakartaBold text-gray-800 dark:text-white mb-2">
            Resumen de Pagos
          </Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Total dividido: {payments.length} método
              {payments.length !== 1 ? "s" : ""}
            </Text>
            <Text className="text-sm font-JakartaBold text-gray-800 dark:text-white">
              ${totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default MultiplePaymentProgress;
