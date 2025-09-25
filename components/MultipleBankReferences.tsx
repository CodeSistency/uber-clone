import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { icons } from "@/constants";

// Icono de reloj usando texto emoji
const ClockIcon = ({ color }: { color?: string }) => (
  <Text className="text-gray-500" style={{ color }}>
    🕐
  </Text>
);

import BankReferenceCard from "./BankReferenceCard";
import { BankReference, SplitPayment } from "@/lib/paymentValidation";

interface MultipleBankReferencesProps {
  payments: SplitPayment[];
  references: BankReference[];
  onCopySuccess?: () => void;
  onExpired?: (reference: BankReference) => void;
  className?: string;
}

const MultipleBankReferences: React.FC<MultipleBankReferencesProps> = ({
  payments,
  references,
  onCopySuccess,
  onExpired,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedReference, setSelectedReference] = useState<number | null>(
    null,
  );

  // Combinar pagos con referencias
  const paymentsWithReferences = payments.map((payment, index) => ({
    ...payment,
    reference: references[index] || null,
  }));

  const activeReferences = references.filter((ref) => !ref.isExpired);
  const expiredReferences = references.filter((ref) => ref.isExpired);

  const handleCopySuccess = () => {
    onCopySuccess?.();
    setSelectedReference(null);
  };

  const handleExpired = (reference: BankReference) => {
    onExpired?.(reference);
  };

  if (references.length === 0) {
    return (
      <View
        className={`bg-gray-50 dark:bg-gray-800 rounded-xl p-4 ${className}`}
      >
        <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
          No hay referencias bancarias disponibles
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`bg-white dark:bg-brand-primaryDark rounded-xl ${className}`}
    >
      {/* Header */}
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
      >
        <View className="flex-row items-center">
          <Image source={icons.dollar} className="w-5 h-5" />
          <Text className="text-lg font-JakartaBold text-gray-800 dark:text-white ml-2">
            Referencias Bancarias
          </Text>
          <View className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <Text className="text-xs font-JakartaMedium text-blue-700 dark:text-blue-300">
              {activeReferences.length} activas
            </Text>
          </View>
        </View>

        <Text className="text-gray-500">{isExpanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Resumen colapsado */}
      {!isExpanded && (
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Referencias válidas
            </Text>
            <Text className="text-sm font-JakartaBold text-green-600">
              {activeReferences.length}
            </Text>
          </View>

          {expiredReferences.length > 0 && (
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Referencias expiradas
              </Text>
              <Text className="text-sm font-JakartaBold text-red-600">
                {expiredReferences.length}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => setIsExpanded(true)}
            className="mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 items-center"
          >
            <Text className="text-sm font-JakartaMedium text-blue-700 dark:text-blue-300">
              Ver todas las referencias
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista expandida */}
      {isExpanded && (
        <ScrollView className="max-h-96">
          <View className="p-4 space-y-4">
            {paymentsWithReferences.map((payment, index) => (
              <View key={payment.id}>
                {/* Información del pago */}
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Text className="text-sm font-JakartaMedium text-gray-700 dark:text-gray-300">
                      Pago {index + 1}: {payment.description}
                    </Text>
                  </View>
                  <Text className="text-sm font-JakartaBold text-gray-800 dark:text-white">
                    Bs. {payment.amount.toLocaleString("es-VE")}
                  </Text>
                </View>

                {/* Referencia bancaria */}
                {payment.reference ? (
                  <TouchableOpacity
                    onPress={() =>
                      setSelectedReference(
                        selectedReference === index ? null : index,
                      )
                    }
                    className="mb-3"
                  >
                    <BankReferenceCard
                      reference={payment.reference}
                      onCopySuccess={handleCopySuccess}
                      onExpired={() => handleExpired(payment.reference)}
                      className={
                        selectedReference === index
                          ? "border-blue-300 dark:border-blue-600"
                          : ""
                      }
                    />
                  </TouchableOpacity>
                ) : (
                  <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-3">
                    <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      {payment.method === "cash"
                        ? "💵 Pago en efectivo - No requiere referencia"
                        : "Generando referencia bancaria..."}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            {/* Instrucciones generales */}
            <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <Text className="text-sm font-JakartaBold text-blue-800 dark:text-blue-200 mb-2">
                📋 Instrucciones Generales
              </Text>
              <Text className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                • Complete los pagos en cualquier orden
              </Text>
              <Text className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                • Use la referencia exacta para cada pago
              </Text>
              <Text className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                • El conductor confirmará cada pago automáticamente
              </Text>
              <Text className="text-sm text-blue-700 dark:text-blue-300">
                • El servicio se activará cuando todos los pagos estén
                confirmados
              </Text>
            </View>

            {/* Estado general */}
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-JakartaMedium text-gray-700 dark:text-gray-300">
                  Estado General
                </Text>
                <View className="flex-row items-center">
                  <ClockIcon color="#6B7280" />
                  <Text className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                    Actualización automática
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Referencias activas: {activeReferences.length}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  Expiradas: {expiredReferences.length}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default MultipleBankReferences;
