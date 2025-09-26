import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";

import { useUI } from "@/components/UIWrapper";
import { icons } from "@/constants";
import {
  SplitPayment,
  validatePaymentSplit,
  calculatePaymentSuggestions,
  formatMultiplePaymentsForAPI,
  VENEZUELAN_PAYMENT_METHODS,
  BankReference,
  generateBulkReferences,
} from "@/lib/paymentValidation";

import MultipleBankReferences from "./MultipleBankReferences";

interface MultiplePaymentSplitterProps {
  totalAmount: number;
  serviceType: "ride" | "delivery" | "errand" | "parcel";
  serviceId: number;
  onPaymentSplit: (payments: SplitPayment[]) => void;
  onCancel: () => void;
  className?: string;
}

interface PaymentSuggestion {
  label: string;
  description: string;
  payments: SplitPayment[];
  icon: string;
}

const MultiplePaymentSplitter: React.FC<MultiplePaymentSplitterProps> = ({
  totalAmount,
  serviceType,
  serviceId,
  onPaymentSplit,
  onCancel,
  className = "",
}) => {
  const { showSuccess, showError } = useUI();
  const [payments, setPayments] = useState<SplitPayment[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validation, setValidation] = useState({
    isValid: true,
    error: "",
    totalSplit: 0,
  });
  const [bankReferences, setBankReferences] = useState<BankReference[]>([]);
  const [showReferences, setShowReferences] = useState(false);
  const [isGeneratingReferences, setIsGeneratingReferences] = useState(false);

  // Métodos de pago disponibles
  const availableMethods = Object.keys(VENEZUELAN_PAYMENT_METHODS);

  // Calcular sugerencias
  const suggestions: PaymentSuggestion[] = React.useMemo(() => {
    const paymentSuggestions = calculatePaymentSuggestions(
      totalAmount,
      availableMethods,
    );

    return paymentSuggestions.map((suggestion, index) => {
      const descriptions = [
        "División 50% - 50%",
        "70% efectivo + 30% otro método",
        "60% transferencia + 40% efectivo",
        "División en partes iguales",
      ];

      const icons = ["⚖️", "💰", "🏦", "🎯"];

      return {
        label: `Opción ${index + 1}`,
        description: descriptions[index] || "División personalizada",
        payments: suggestion,
        icon: icons[index] || "💳",
      };
    });
  }, [totalAmount, availableMethods]);

  // Validar pagos cuando cambien
  useEffect(() => {
    if (payments.length > 0) {
      const result = validatePaymentSplit(payments, totalAmount);
      setValidation({
        isValid: result.isValid,
        error: result.error || "",
        totalSplit: result.totalSplit,
      });
    }
  }, [payments, totalAmount]);

  // Agregar un nuevo método de pago
  const addPaymentMethod = (methodId: string) => {
    const remainingAmount =
      totalAmount - payments.reduce((sum, p) => sum + p.amount, 0);

    if (remainingAmount <= 0) {
      showError("Error", "El monto total ya está cubierto");
      return;
    }

    try {
      // Si es el primer pago, asignar todo el monto restante
      const amount =
        payments.length === 0
          ? totalAmount
          : Math.min(remainingAmount, totalAmount * 0.5);

      const newPayment = {
        id: `${methodId}_${Date.now()}`,
        method:
          VENEZUELAN_PAYMENT_METHODS[methodId].type === "cash"
            ? "cash"
            : VENEZUELAN_PAYMENT_METHODS[methodId].type === "transfer"
              ? "card"
              : ("wallet" as "cash" | "card" | "wallet"),
        amount,
        percentage: (amount / totalAmount) * 100,
        bankCode: VENEZUELAN_PAYMENT_METHODS[methodId].bankCode,
        description: VENEZUELAN_PAYMENT_METHODS[methodId].description,
        status: "pending" as const,
      };

      setPayments((prev) => [...prev, newPayment]);
    } catch (error) {
      showError("Error", "Método de pago no válido");
    }
  };

  // Actualizar monto de un pago
  const updatePaymentAmount = (paymentId: string, newAmount: number) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === paymentId
          ? {
              ...payment,
              amount: newAmount,
              percentage: (newAmount / totalAmount) * 100,
            }
          : payment,
      ),
    );
  };

  // Eliminar un pago
  const removePayment = (paymentId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
  };

  // Aplicar una sugerencia
  const applySuggestion = (suggestion: PaymentSuggestion) => {
    setPayments(suggestion.payments);
    setShowSuggestions(false);
  };

  // Confirmar pagos múltiples
  const confirmMultiplePayments = async () => {
    if (!validation.isValid) {
      showError("Error", validation.error || "Los pagos no son válidos");
      return;
    }

    if (payments.length === 0) {
      showError("Error", "Debe agregar al menos un método de pago");
      return;
    }

    setIsGeneratingReferences(true);

    try {
      // 🆕 Para el contexto de UnifiedFlow, este componente ahora solo configura los pagos
      // Los pagos reales se procesan en PaymentMethodology usando los nuevos endpoints

      console.log("Configurando pagos múltiples:", payments);

      // Convertir pagos al formato esperado por los nuevos endpoints
      const formattedPayments = payments.map((payment, index) => {
        // Map payment methods to SplitPayment compatible types
        const methodMap: Record<string, "cash" | "card" | "wallet"> = {
          cash: "cash",
          transfer: "card", // Map transfer to card
          pago_movil: "wallet", // Map pago_movil to wallet
          zelle: "wallet", // Map zelle to wallet
          bitcoin: "wallet", // Map bitcoin to wallet
          card: "card",
          wallet: "wallet",
        };

        return {
          method: methodMap[payment.method] || "cash",
          amount: payment.amount,
          bankCode: payment.bankCode,
          id: `payment_${index}_${Date.now()}`,
          percentage: 0, // TODO: Calculate percentage
          description: `Pago ${payment.method}`,
          status: "pending" as const,
        };
      });

      // Generar referencias de preview para mostrar al usuario (simulación)
      const paymentsNeedingReferences = payments.filter(
        (p) => p.method !== "cash" && p.bankCode,
      );

      let generatedReferences: BankReference[] = [];

      if (paymentsNeedingReferences.length > 0) {
        console.log("Generando preview de referencias bancarias...");

        // Crear array de pagos para generar referencias de preview
        const paymentsForReferences = paymentsNeedingReferences.map((p) => ({
          bankCode: p.bankCode!,
          amount: p.amount,
        }));

        generatedReferences = generateBulkReferences(
          paymentsForReferences,
          serviceId,
        );

        console.log(
          `Generadas ${generatedReferences.length} referencias de preview`,
        );
      }

      // Almacenar referencias generadas (para mostrar preview)
      setBankReferences(generatedReferences);

      // Llamar al callback con los pagos formateados
      onPaymentSplit(formattedPayments);

      // Mostrar referencias bancarias si existen
      if (generatedReferences.length > 0) {
        setShowReferences(true);
        showSuccess(
          "¡Pagos configurados!",
          `Vista previa de ${generatedReferences.length} referencias bancarias`,
        );
      } else {
        showSuccess("¡Listo!", `Pago dividido en ${payments.length} métodos`);
      }
    } catch (error: any) {
      console.error("Error configurando pagos:", error);
      showError(
        "Error",
        error?.message || "No se pudieron configurar los pagos",
      );
    } finally {
      setIsGeneratingReferences(false);
    }
  };

  // Calcular total actual
  const currentTotal = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = totalAmount - currentTotal;

  return (
    <View
      className={`bg-white dark:bg-brand-primaryDark rounded-xl p-6 ${className}`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-xl font-JakartaBold text-gray-800 dark:text-white">
            💰 Pagos Múltiples
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Divide tu pago en diferentes métodos
          </Text>
        </View>
        <TouchableOpacity
          onPress={onCancel}
          className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full"
        >
          <Text className="text-lg">✕</Text>
        </TouchableOpacity>
      </View>

      {/* Monto Total */}
      <View className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-JakartaMedium text-gray-600 dark:text-gray-400">
              Monto Total
            </Text>
            <Text className="text-2xl font-JakartaBold text-primary-600">
              ${totalAmount.toFixed(2)}
            </Text>
          </View>
          <Image source={icons.dollar} className="w-6 h-6" />
        </View>
      </View>

      {/* Estado de Validación */}
      {payments.length > 0 && (
        <View
          className={`rounded-lg p-3 mb-4 ${
            validation.isValid
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200"
          }`}
        >
          <Text
            className={`text-sm font-JakartaMedium ${
              validation.isValid
                ? "text-green-700 dark:text-green-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {validation.isValid
              ? `✅ Monto correcto: $${currentTotal.toFixed(2)}`
              : `❌ ${validation.error}`}
          </Text>
        </View>
      )}

      {/* Lista de Pagos */}
      <ScrollView className="max-h-60 mb-4">
        {payments.map((payment, index) => (
          <View
            key={payment.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-3"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">
                  {payment.method === "cash"
                    ? "💵"
                    : payment.method === "card"
                      ? "💳"
                      : "📱"}
                </Text>
                <View>
                  <Text className="font-JakartaMedium text-gray-800 dark:text-white">
                    {payment.description}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    {payment.percentage.toFixed(1)}% del total
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => removePayment(payment.id)}
                className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"
              >
                <Text className="text-red-500">🗑️</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center">
              <Text className="text-lg font-JakartaMedium mr-2 text-gray-700 dark:text-gray-300">
                $
              </Text>
              <TextInput
                value={payment.amount.toString()}
                onChangeText={(value) => {
                  const amount = parseFloat(value) || 0;
                  updatePaymentAmount(payment.id, amount);
                }}
                keyboardType="numeric"
                className="flex-1 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 text-lg font-JakartaMedium border border-gray-200 dark:border-gray-600"
                placeholder="0.00"
              />
            </View>

            {payment.reference && (
              <View className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Text className="text-xs font-JakartaMedium text-blue-700 dark:text-blue-300">
                  📋 Ref: {payment.reference}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Agregar Método de Pago */}
      <View className="mb-4">
        <Text className="text-sm font-JakartaBold text-gray-700 dark:text-gray-300 mb-2">
          Agregar Método de Pago
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2">
            {availableMethods.map((methodId) => {
              const method = VENEZUELAN_PAYMENT_METHODS[methodId];
              const isAlreadyUsed = payments.some(
                (p) => p.description === method.description,
              );

              return (
                <TouchableOpacity
                  key={methodId}
                  onPress={() => addPaymentMethod(methodId)}
                  disabled={isAlreadyUsed}
                  className={`px-4 py-3 rounded-lg border-2 min-w-[120px] ${
                    isAlreadyUsed
                      ? "border-gray-200 bg-gray-100 dark:bg-gray-700"
                      : "border-primary bg-primary-50 dark:bg-primary-900/20"
                  }`}
                >
                  <Text className="text-center text-sm font-JakartaMedium">
                    {method.type === "cash"
                      ? "💵"
                      : method.type === "transfer"
                        ? "🏦"
                        : "📱"}
                  </Text>
                  <Text
                    className={`text-center text-xs mt-1 ${
                      isAlreadyUsed
                        ? "text-gray-500"
                        : "text-primary-700 dark:text-primary-300"
                    }`}
                  >
                    {method.description.split(" - ")[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Sugerencias Rápidas */}
      <View className="mb-4">
        <TouchableOpacity
          onPress={() => setShowSuggestions(!showSuggestions)}
          className="flex-row items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
        >
          <Text className="text-blue-500">⚡</Text>
          <Text className="text-sm font-JakartaMedium text-blue-700 dark:text-blue-300 ml-2">
            Sugerencias Rápidas
          </Text>
        </TouchableOpacity>

        {showSuggestions && (
          <View className="mt-2 space-y-2">
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => applySuggestion(suggestion)}
                className="flex-row items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <Text className="text-lg mr-3">{suggestion.icon}</Text>
                <View className="flex-1">
                  <Text className="font-JakartaMedium text-gray-800 dark:text-white">
                    {suggestion.label}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    {suggestion.description}
                  </Text>
                </View>
                <Image source={icons.target} className="w-4 h-4" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Monto Restante */}
      {remainingAmount > 0 && (
        <View className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 mb-4">
          <Text className="text-sm font-JakartaMedium text-orange-700 dark:text-orange-300">
            💰 Monto restante: ${remainingAmount.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Botones de Acción */}
      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={onCancel}
          className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl p-4"
        >
          <Text className="text-center font-JakartaMedium text-gray-700 dark:text-gray-300">
            Cancelar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={confirmMultiplePayments}
          disabled={!validation.isValid || payments.length === 0}
          className={`flex-1 rounded-xl p-4 ${
            validation.isValid && payments.length > 0
              ? "bg-primary-500"
              : "bg-gray-300"
          }`}
        >
          <Text className="text-center font-JakartaBold text-white">
            Confirmar Pagos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vista de Referencias Bancarias */}
      {showReferences && bankReferences.length > 0 && (
        <View className="mt-6">
          <View className="flex-row items-center mb-4">
            <Image source={icons.dollar} className="w-5 h-5" />
            <Text className="text-lg font-JakartaBold text-gray-800 dark:text-white ml-2">
              Referencias Generadas
            </Text>
          </View>

          <MultipleBankReferences
            payments={payments}
            references={bankReferences}
            onCopySuccess={() =>
              showSuccess("¡Copiado!", "Referencia copiada al portapapeles")
            }
            onExpired={(reference) => {
              showError(
                "Referencia Expirada",
                `La referencia para ${reference.amount}Bs ha expirado`,
              );
            }}
          />

          <TouchableOpacity
            onPress={() => {
              setShowReferences(false);
              onCancel();
            }}
            className="mt-4 bg-green-500 rounded-xl p-4 items-center"
          >
            <Text className="text-white font-JakartaBold">
              Completar y Continuar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Indicador de generación */}
      {isGeneratingReferences && (
        <View className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <View className="flex-row items-center justify-center">
            <ActivityIndicator size="small" color="#0286FF" />
            <Text className="text-sm font-JakartaMedium text-blue-700 dark:text-blue-300 ml-2">
              Generando referencias bancarias...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default MultiplePaymentSplitter;
