import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
} from "react-native";

import { useUI } from "@/components/UIWrapper";
import { icons } from "@/constants";
import { SplitPayment } from "@/lib/paymentValidation";

import MultiplePaymentSplitter from "./MultiplePaymentSplitter";

interface PaymentMethod {
  id: string;
  type: "card" | "cash" | "wallet";
  title: string;
  details: string;
  icon: string;
  isDefault?: boolean;
  isRecommended?: boolean;
  showBalance?: boolean;
}

interface PaymentMethodSelectorProps {
  selectedMethodId: string | null;
  onSelectMethod: (methodId: string) => void;
  className?: string;
  enableMultiplePayments?: boolean;
  totalAmount?: number;
  serviceType?: "ride" | "delivery" | "errand" | "parcel";
  serviceId?: number;
  onMultiplePaymentSelect?: (payments: SplitPayment[]) => void;
  paymentMode?: "single" | "multiple";
  onPaymentModeChange?: (mode: "single" | "multiple") => void;
  // Wallet props
  showWalletBalance?: boolean;
  walletBalance?: number;
  walletCurrency?: string;
  hasSufficientWalletBalance?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "wallet",
    type: "wallet",
    title: "Wallet",
    details: "Pago instantáneo desde tu saldo",
    icon: "💰",
    isDefault: false,
  },
  {
    id: "cash",
    type: "cash",
    title: "Efectivo",
    details: "Pago directo al conductor",
    icon: "💵",
    isDefault: true,
  },
  {
    id: "transfer_banesco",
    type: "card",
    title: "Transferencia",
    details: "Banesco - 20 dígitos",
    icon: "🏦",
  },
  {
    id: "transfer_mercantil",
    type: "card",
    title: "Transferencia",
    details: "Mercantil - 20 dígitos",
    icon: "🏦",
  },
  {
    id: "pago_movil_banesco",
    type: "wallet",
    title: "Pago Móvil",
    details: "Banesco - 20 dígitos",
    icon: "📱",
  },
  {
    id: "pago_movil_mercantil",
    type: "wallet",
    title: "Pago Móvil",
    details: "Mercantil - 20 dígitos",
    icon: "📱",
  },
  {
    id: "zelle",
    type: "wallet",
    title: "Zelle",
    details: "Confirmación directa",
    icon: "💳",
  },
  {
    id: "bitcoin",
    type: "wallet",
    title: "Bitcoin",
    details: "Dirección de wallet",
    icon: "₿",
  },
  {
    id: "add_new",
    type: "card",
    title: "Agregar Método",
    details: "Nuevo método de pago",
    icon: "➕",
  },
];

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethodId,
  onSelectMethod,
  className = "",
  enableMultiplePayments = false,
  totalAmount = 0,
  serviceType = "ride",
  serviceId = 1,
  onMultiplePaymentSelect,
  paymentMode: externalPaymentMode,
  onPaymentModeChange,
  // Wallet props
  showWalletBalance = false,
  walletBalance = 0,
  walletCurrency = "VES",
  hasSufficientWalletBalance = false,
}) => {
  const { theme } = useUI();
  const [showMultiplePaymentModal, setShowMultiplePaymentModal] =
    React.useState(false);
  const [internalPaymentMode, setInternalPaymentMode] = React.useState<
    "single" | "multiple"
  >("single");

  // Usar modo externo si se proporciona, sino usar interno
  const paymentMode =
    externalPaymentMode !== undefined
      ? externalPaymentMode
      : internalPaymentMode;

  const handlePaymentModeChange = (newMode: "single" | "multiple") => {
    if (onPaymentModeChange) {
      onPaymentModeChange(newMode);
    } else {
      setInternalPaymentMode(newMode);
    }
  };

  const handleMultiplePaymentSelect = (payments: SplitPayment[]) => {
    setShowMultiplePaymentModal(false);
    onMultiplePaymentSelect?.(payments);
  };

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => {
    const isSelected = selectedMethodId === item.id;
    const isAddNew = item.id === "add_new";
    const isWallet = item.id === "wallet";

    // Wallet specific logic
    const showWalletRecommended = isWallet && hasSufficientWalletBalance;
    const showWalletInsufficient = isWallet && showWalletBalance && !hasSufficientWalletBalance;

    return (
      <TouchableOpacity
        onPress={() => onSelectMethod(item.id)}
        className={`mr-4 p-4 rounded-xl border-2 min-w-[140px] ${
          isSelected
            ? "border-primary bg-primary-50"
            : showWalletRecommended
            ? "border-green-400 bg-green-50"
            : `border-gray-200 dark:border-gray-600 bg-brand-primary dark:bg-brand-primaryDark`
        } shadow-sm`}
      >
        <View className="items-center mb-3">
          <Text
            className={`text-2xl ${isSelected ? "opacity-100" : "opacity-70"}`}
          >
            {item.icon}
          </Text>

          {/* Wallet balance display */}
          {isWallet && showWalletBalance && (
            <Text className={`text-xs font-JakartaMedium mt-1 ${
              hasSufficientWalletBalance ? "text-green-600" : "text-red-500"
            }`}>
              {new Intl.NumberFormat('es-VE', {
                style: 'currency',
                currency: walletCurrency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(walletBalance)}
            </Text>
          )}
        </View>

        <Text
          className={`font-JakartaSemiBold text-sm mb-1 text-center ${
            isSelected ? "text-primary" : `text-gray-800 dark:text-gray-200`
          }`}
        >
          {item.title}
        </Text>

        <Text
          className={`text-xs text-center mb-2 ${
            isSelected ? "text-primary-600" : `text-gray-600 dark:text-gray-400`
          }`}
        >
          {item.details}
        </Text>

        {item.isDefault && (
          <View className="bg-primary rounded-full px-2 py-1 mt-1">
            <Text className="text-white text-xs text-center font-JakartaMedium">
              Default
            </Text>
          </View>
        )}

        {showWalletRecommended && (
          <View className="bg-green-500 rounded-full px-2 py-1 mt-1">
            <Text className="text-white text-xs text-center font-JakartaMedium">
              Recomendado
            </Text>
          </View>
        )}

        {isSelected && !isAddNew && (
          <View className="w-6 h-6 bg-primary rounded-full items-center justify-center mt-2 self-center">
            <Text className="text-white text-sm font-bold">✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View className={`mb-6 ${className}`}>
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-JakartaBold">
            Sistema de Pagos Venezolano
          </Text>

          {/* Toggle Pago Único/Múltiple */}
          {enableMultiplePayments && (
            <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <TouchableOpacity
                onPress={() => handlePaymentModeChange("single")}
                className={`px-3 py-1 rounded-md ${
                  paymentMode === "single"
                    ? "bg-white dark:bg-gray-700 shadow-sm"
                    : "transparent"
                }`}
              >
                <Text
                  className={`text-sm font-JakartaMedium ${
                    paymentMode === "single"
                      ? "text-primary"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Único
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePaymentModeChange("multiple")}
                className={`px-3 py-1 rounded-md ${
                  paymentMode === "multiple"
                    ? "bg-white dark:bg-gray-700 shadow-sm"
                    : "transparent"
                }`}
              >
                <Text
                  className={`text-sm font-JakartaMedium ${
                    paymentMode === "multiple"
                      ? "text-primary"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Múltiple
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {paymentMode === "single" ? (
          <>
            <FlatList
              data={paymentMethods}
              renderItem={renderPaymentMethod}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            />

            {selectedMethodId && selectedMethodId !== "add_new" && (
              <View className="mt-4 p-4 bg-primary-50 rounded-lg mx-5">
                <Text className="text-sm font-JakartaSemiBold text-primary mb-1">
                  Método de Pago Seleccionado
                </Text>
                <Text className="text-xs text-primary-600">
                  {paymentMethods.find((m) => m.id === selectedMethodId)?.title}{" "}
                  •{" "}
                  {
                    paymentMethods.find((m) => m.id === selectedMethodId)
                      ?.details
                  }
                </Text>
              </View>
            )}
          </>
        ) : (
          /* Pago Múltiple */
          <View className="px-5">
            <TouchableOpacity
              onPress={() => setShowMultiplePaymentModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 items-center"
            >
              <Text className="text-3xl mb-2">💰</Text>
              <Text className="text-white font-JakartaBold text-lg mb-1">
                Pagos Múltiples
              </Text>
              <Text className="text-white/80 font-JakartaMedium text-sm text-center">
                Divide tu pago en diferentes métodos
              </Text>
              <Text className="text-white font-JakartaBold text-xl mt-2">
                ${totalAmount.toFixed(2)}
              </Text>
            </TouchableOpacity>

            <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
              Ejemplo: 70% efectivo + 30% transferencia
            </Text>
          </View>
        )}
      </View>

      {/* Modal de Pagos Múltiples */}
      <Modal
        visible={showMultiplePaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMultiplePaymentModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="max-h-[80%]">
            <MultiplePaymentSplitter
              totalAmount={totalAmount}
              serviceType={serviceType}
              serviceId={serviceId}
              onPaymentSplit={handleMultiplePaymentSelect}
              onCancel={() => setShowMultiplePaymentModal(false)}
              className="rounded-t-3xl"
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default PaymentMethodSelector;
