import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Image } from "react-native";
import { icons } from "@/constants";

// Icono de copiar usando texto emoji
const CopyIcon = () => <Text className="text-blue-500">📋</Text>;

import { BankReference, getBankInfo, calculateTimeRemaining, isReferenceExpired } from "@/lib/paymentValidation";
import { useUI } from "@/components/UIWrapper";

interface BankReferenceCardProps {
  reference: BankReference;
  onCopySuccess?: () => void;
  onExpired?: () => void;
  className?: string;
}

const BankReferenceCard: React.FC<BankReferenceCardProps> = ({
  reference,
  onCopySuccess,
  onExpired,
  className = ""
}) => {
  const { showSuccess, showError } = useUI();
  const [timeRemaining, setTimeRemaining] = useState(reference.timeRemaining);
  const [isExpired, setIsExpired] = useState(reference.isExpired);

  // Actualizar tiempo restante cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining(reference.expiresAt);

      setTimeRemaining(newTimeRemaining);
      setIsExpired(newTimeRemaining.isExpired);

      if (newTimeRemaining.isExpired && !isExpired) {
        onExpired?.();
      }
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [reference.expiresAt, isExpired, onExpired]);

  const bankInfo = getBankInfo(reference.bankCode);

  const handleCopyReference = async () => {
    try {
      // En una app real, usaríamos Clipboard
      console.log("Copiando referencia:", reference.referenceNumber);

      // Simular copiado exitoso
      showSuccess("¡Copiado!", "Referencia copiada al portapapeles");
      onCopySuccess?.();
    } catch (error) {
      showError("Error", "No se pudo copiar la referencia");
    }
  };

  const getUrgencyColor = () => {
    if (isExpired) return "#EF4444"; // Rojo para expirado
    if (timeRemaining.hours < 1) return "#F59E0B"; // Amarillo para menos de 1 hora
    return "#10B981"; // Verde para tiempo suficiente
  };

  const getUrgencyText = () => {
    if (isExpired) return "EXPIRADA";
    if (timeRemaining.hours < 1) return "URGENTE";
    return "VÁLIDA";
  };

  const formatTimeRemaining = () => {
    if (isExpired) return "Expirada";
    if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    }
    return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
  };

  return (
    <View className={`bg-white dark:bg-brand-primaryDark rounded-xl p-4 border-2 ${
      isExpired ? "border-red-200 dark:border-red-800" : "border-gray-200 dark:border-gray-700"
    } ${className}`}>

      {/* Header con banco y estado */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Image source={icons.dollar} className="w-5 h-5" />
          <Text className="text-lg font-JakartaBold text-gray-800 dark:text-white ml-2">
            {bankInfo?.shortName || "Banco"}
          </Text>
        </View>

        <View className={`px-2 py-1 rounded-full ${
          isExpired ? "bg-red-100 dark:bg-red-900/20" : "bg-green-100 dark:bg-green-900/20"
        }`}>
          <Text className={`text-xs font-JakartaBold ${
            isExpired ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"
          }`}>
            {getUrgencyText()}
          </Text>
        </View>
      </View>

      {/* Monto */}
      <View className="mb-3">
        <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Monto a transferir
        </Text>
        <Text className="text-xl font-JakartaBold text-gray-800 dark:text-white">
          Bs. {reference.amount.toLocaleString('es-VE')}
        </Text>
      </View>

      {/* Referencia bancaria */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-JakartaMedium text-gray-700 dark:text-gray-300">
            Referencia bancaria
          </Text>
          <TouchableOpacity
            onPress={handleCopyReference}
            disabled={isExpired}
            className={`flex-row items-center px-3 py-1 rounded-lg ${
              isExpired
                ? "bg-gray-100 dark:bg-gray-700"
                : "bg-blue-100 dark:bg-blue-900/20"
            }`}
          >
            <CopyIcon />
            <Text className={`text-sm font-JakartaMedium ml-1 ${
              isExpired
                ? "text-gray-500 dark:text-gray-400"
                : "text-blue-700 dark:text-blue-300"
            }`}>
              Copiar
            </Text>
          </TouchableOpacity>
        </View>

        <View className={`p-3 rounded-lg border-2 ${
          isExpired
            ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
            : "border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
        }`}>
          <Text className={`text-center font-mono text-lg tracking-wider ${
            isExpired
              ? "text-red-700 dark:text-red-300"
              : "text-gray-800 dark:text-white"
          }`}>
            {reference.formattedReference}
          </Text>
        </View>
      </View>

      {/* Tiempo restante y acciones */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image source={icons.point} className="w-4 h-4" style={{ tintColor: getUrgencyColor() }} />
          <Text className="text-sm font-JakartaMedium ml-1" style={{ color: getUrgencyColor() }}>
            {formatTimeRemaining()}
          </Text>
        </View>

        {isExpired ? (
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Referencia Expirada",
                "Esta referencia ha expirado. Solicite una nueva referencia al conductor.",
                [{ text: "Entendido" }]
              );
            }}
            className="flex-row items-center bg-red-100 dark:bg-red-900/20 px-3 py-1 rounded-lg"
          >
            <Text className="text-sm text-red-600">⚠️</Text>
            <Text className="text-sm font-JakartaMedium text-red-700 dark:text-red-300 ml-1">
              Expirada
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Instrucciones de Pago",
                `1. Abra la app de su banco\n2. Seleccione "Transferir"\n3. Use la referencia: ${reference.referenceNumber}\n4. Confirme el pago\n5. El conductor recibirá confirmación automática`,
                [{ text: "Entendido", style: "default" }]
              );
            }}
            className="flex-row items-center bg-blue-100 dark:bg-blue-900/20 px-3 py-1 rounded-lg"
          >
            <Text className="text-sm text-blue-600">ℹ️</Text>
            <Text className="text-sm font-JakartaMedium text-blue-700 dark:text-blue-300 ml-1">
              ¿Cómo pagar?
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Información adicional del banco */}
      {bankInfo && (
        <View className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Text className="text-xs text-gray-600 dark:text-gray-400">
            💰 {bankInfo.description}
          </Text>
          {bankInfo.maxTransferAmount && (
            <Text className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              📊 Límite diario: Bs. {bankInfo.maxTransferAmount.toLocaleString('es-VE')}
            </Text>
          )}
        </View>
      )}

      {/* Recordatorio de expiración */}
      {!isExpired && timeRemaining.hours < 2 && (
        <View className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <Text className="text-xs text-yellow-700 dark:text-yellow-300 text-center">
            ⚠️ Esta referencia expira pronto. Complete el pago antes de que expire.
          </Text>
        </View>
      )}
    </View>
  );
};

export default BankReferenceCard;
