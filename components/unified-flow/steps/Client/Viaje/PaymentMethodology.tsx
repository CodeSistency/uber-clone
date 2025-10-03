import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";

import { transportClient } from "@/app/services/flowClientService";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import {
  mapPaymentMethodToAPI,
  validatePaymentMethod,
  validatePaymentWithData,
  SplitPayment,
  createSplitPayment,
} from "@/lib/paymentValidation";
import { usePaymentStore, useWalletStore } from "@/store";
import { VENEZUELAN_BANKS } from "@/lib/paymentValidation";
import { useMapFlowStore } from "@/store/mapFlow/mapFlow";

import FlowHeader from "../../../FlowHeader";

// Componente para mostrar saldo del wallet
const WalletBalanceIndicator: React.FC<{
  balance: number;
  currency: string;
  onRecargar?: () => void;
}> = ({ balance, currency, onRecargar }) => {
  const formattedBalance = new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: currency === 'VES' ? 'VES' : 'USD',
    minimumFractionDigits: 2,
  }).format(balance);

  return (
    <View className="bg-green-50 rounded-lg p-3 mb-3 border border-green-200">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">💰</Text>
          <View>
            <Text className="font-JakartaMedium text-green-800">
              Saldo disponible
            </Text>
            <Text className="font-JakartaBold text-green-900 text-lg">
              {formattedBalance}
            </Text>
          </View>
        </View>
        {onRecargar && balance < 50 && (
          <TouchableOpacity
            onPress={onRecargar}
            className="bg-green-600 rounded-lg px-3 py-2"
          >
            <Text className="text-white font-JakartaMedium text-sm">
              Recargar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Componente BankSelector para selección de banco venezolano
const BankSelector: React.FC<{
  selectedBankCode: string | null;
  onBankSelect: (bankCode: string) => void;
  paymentMethod: string | null;
}> = ({ selectedBankCode, onBankSelect, paymentMethod }) => {
  const banks = Object.values(VENEZUELAN_BANKS);

  // Filtrar bancos según el método de pago
  const filteredBanks = banks.filter(bank => {
    if (paymentMethod === "transfer") {
      return bank.supportsTransfers;
    } else if (paymentMethod === "pago_movil") {
      return bank.supportsPagoMovil;
    }
    return true;
  });

  return (
    <View className="mt-4">
      <Text className="font-JakartaMedium text-gray-700 mb-3">
        Selecciona tu banco
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
        <View className="flex-row space-x-2 px-1">
          {filteredBanks.map((bank) => (
            <TouchableOpacity
              key={bank.code}
              onPress={() => onBankSelect(bank.code)}
              className={`px-4 py-3 rounded-lg border min-w-[120px] ${
                selectedBankCode === bank.code
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Text
                className={`text-center font-JakartaMedium text-sm ${
                  selectedBankCode === bank.code
                    ? "text-primary-600"
                    : "text-gray-700"
                }`}
              >
                {bank.shortName}
              </Text>
              <Text
                className={`text-center font-Jakarta text-xs mt-1 ${
                  selectedBankCode === bank.code
                    ? "text-primary-500"
                    : "text-gray-500"
                }`}
              >
                {bank.code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {selectedBankCode && (
        <View className="bg-blue-50 rounded-lg p-3 mt-2">
          <Text className="font-JakartaMedium text-blue-800 text-sm">
            Banco seleccionado: {VENEZUELAN_BANKS[selectedBankCode]?.name}
          </Text>
        </View>
      )}
    </View>
  );
};

const PaymentMethodology: React.FC = () => {
  const { next, back } = useMapFlow();
  const { withUI, showSuccess, showError } = useUI();
  const paymentStore = usePaymentStore();
  const walletStore = useWalletStore();

  // 🆕 Acceder directamente al store con selectores específicos de Zustand
  const rideId = useMapFlowStore((state) => state.rideId);
  const estimatedPrice = useMapFlowStore((state) => state.estimatedPrice);
  const priceBreakdown = useMapFlowStore((state) => state.priceBreakdown);
  const routeInfo = useMapFlowStore((state) => state.routeInfo);

  // Estados de pago
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [bankCode, setBankCode] = useState<string | null>(null);
  const [multiplePayments, setMultiplePayments] = useState<SplitPayment[]>([]);
  const [paymentMode, setPaymentMode] = useState<"single" | "multiple">(
    "single",
  );
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Wallet data
  const { balance, hasWallet, hasSufficientBalance, formattedBalance, loadWalletData } = walletStore;

  // Load wallet data on mount
  React.useEffect(() => {
    loadWalletData();
  }, []);

  // Monto estimado del viaje (viene del store después del cálculo)
  const estimatedFare: number = estimatedPrice || 0;

  // Debug when estimatedPrice changes
  React.useEffect(() => {
  }, [estimatedPrice]);

  // Auto-select wallet if available and has sufficient balance
  React.useEffect(() => {
    if (hasWallet && hasSufficientBalance(estimatedFare) && !paymentMethod) {
      setPaymentMethod("wallet");
    }
  }, [hasWallet, balance, estimatedFare, paymentMethod]);

  // Validaciones con datos adicionales
  const paymentValidation = validatePaymentWithData(
    paymentMethod || "",
    bankCode || undefined
  );
  const canContinue =
    !isProcessingPayment &&
    (paymentMode === "single"
      ? paymentValidation.isValid
      : multiplePayments.length > 0);

  // Función para manejar cambio de modo de pago
  const handlePaymentModeChange = (newMode: "single" | "multiple") => {
    setPaymentMode(newMode);

    // Resetear estados cuando cambie el modo
    if (newMode === "single") {
      setMultiplePayments([]);
    } else {
      setPaymentMethod(null);
      setBankCode(null); // Reset bank code when switching modes
    }

    console.log("[PaymentMethodology] Payment mode changed to:", newMode);
  };

  // Función para manejar cambio de método de pago
  const handlePaymentMethodChange = (newMethod: string) => {
    setPaymentMethod(newMethod);

    // Resetear bankCode cuando se cambie el método
    // Solo mantener si el nuevo método también requiere bankCode
    const requiresBank = newMethod.includes('transfer') || newMethod.includes('pago_movil');
    if (!requiresBank) {
      setBankCode(null);
    }
  };

  // Función para manejar la confirmación de pagos
  const handlePaymentConfirmation = async () => {
    if (!canContinue) return;

    const id = rideId || 101;
    setIsProcessingPayment(true);

    try {
      // Confirmar pago según el modo seleccionado
      if (paymentMode === "single") {
        // 🆕 Pago único usando nuevos endpoints
        const paymentData = mapPaymentMethodToAPI(paymentMethod!);

        // Convertir a formato del backend según documentación
        const methodMapping: Record<string, string> = {
          'transfer': 'transfer',
          'pago_movil': 'pago_movil',
          'zelle': 'zelle',
          'bitcoin': 'bitcoin',
          'cash': 'cash',
          'card': 'transfer', // Map card to transfer for now
          'wallet': 'wallet',  // Add wallet support
        };

        // Validate single payment payload before sending
        if (!estimatedFare || estimatedFare <= 0) {
          throw new Error(`Monto total inválido: ${estimatedFare}`);
        }

        // Backend validation: ensure totalAmount meets constraints
        if (estimatedFare < 0.01) {
          throw new Error(`Monto total debe ser al menos 0.01: ${estimatedFare}`);
        }

        // Ensure it's a valid number with proper formatting
        const validatedTotalAmount = parseFloat(Number(estimatedFare).toFixed(2));
        if (isNaN(validatedTotalAmount)) {
          throw new Error(`Monto total no es un número válido: ${estimatedFare}`);
        }

        const mappedPaymentMethod = methodMapping[paymentData.method] || paymentData.method;
        if (!mappedPaymentMethod || typeof mappedPaymentMethod !== 'string') {
          throw new Error(`Método de pago mapeado inválido: ${mappedPaymentMethod}`);
        }

        // Solo incluir bankCode si el método lo requiere
        const paymentObject: {
          method: "transfer" | "pago_movil" | "zelle" | "bitcoin" | "cash" | "wallet";
          amount: number;
          bankCode?: string;
        } = {
          method: mappedPaymentMethod as "transfer" | "pago_movil" | "zelle" | "bitcoin" | "cash" | "wallet",
          amount: validatedTotalAmount, // Send as number
        };

        // Solo agregar bankCode si existe y el método lo requiere
        if (bankCode && (mappedPaymentMethod.includes('transfer') || mappedPaymentMethod.includes('pago_movil'))) {
          paymentObject.bankCode = bankCode;
        }

        const singlePaymentData = {
          totalAmount: validatedTotalAmount, // Send as number
          payments: [paymentObject],
        };

        const result = await paymentStore.payRideWithMultipleMethods(id, singlePaymentData);

        if (result.data.status === "complete") {
          showSuccess(
            "¡Pago completado!",
            "Ahora buscaremos un conductor para ti",
          );
        } else {
          // Pago electrónico - mostrar referencias si existen
          if (result.data.references?.length > 0) {
            showSuccess(
              "¡Pago configurado!",
              `Generadas ${result.data.references.length} referencias bancarias`,
            );
            // TODO: Navigate to payment confirmation screen
            // navigate('/confirm-payments', {
            //   state: { references: result.data.references, groupId: result.data.groupId }
            // });
          } else {
            showSuccess(
              "¡Pago configurado!",
              "Completa el pago electrónico para continuar",
            );
          }
        }
      } else {
        // 🆕 Pago múltiple usando nuevos endpoints
        if (!Array.isArray(multiplePayments) || multiplePayments.length === 0) {
          console.error("[PaymentMethodology] multiplePayments is not a valid array:", multiplePayments);
          throw new Error("No se han configurado pagos múltiples válidos");
        }

        console.log(
          "[PaymentMethodology] Processing multiple payments:",
          multiplePayments,
        );

        // Convertir SplitPayment a formato del backend según documentación
        const paymentMethods = multiplePayments.map((payment) => {
          // Validate payment object
          if (!payment || typeof payment !== 'object') {
            console.error("[PaymentMethodology] Invalid payment object:", payment);
            throw new Error("Objeto de pago inválido");
          }
          // Mapear métodos del frontend al backend
          const methodMapping: Record<string, string> = {
            'transfer': 'transfer',
            'pago_movil': 'pago_movil',
            'zelle': 'zelle',
            'bitcoin': 'bitcoin',
            'cash': 'cash',
            'card': 'transfer', // Map card to transfer for now
            'wallet': 'wallet',  // Add wallet support
          };

          const mappedMethod = methodMapping[payment.method] || payment.method;

          // Solo incluir bankCode si el método lo requiere
          const paymentObj: {
            method: "transfer" | "pago_movil" | "zelle" | "bitcoin" | "cash" | "wallet";
            amount: number;
            bankCode?: string;
          } = {
            method: mappedMethod as "transfer" | "pago_movil" | "zelle" | "bitcoin" | "cash" | "wallet",
            amount: typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount, // Send as number
          };

          // Solo agregar bankCode si existe y el método lo requiere
          if (payment.bankCode && (mappedMethod.includes('transfer') || mappedMethod.includes('pago_movil'))) {
            paymentObj.bankCode = payment.bankCode;
          }

          return paymentObj;
        });

        // Validate payment payload before sending
        if (!estimatedFare || estimatedFare <= 0) {
          throw new Error(`Monto total inválido: ${estimatedFare}`);
        }

        // Backend validation: ensure totalAmount meets constraints
        if (estimatedFare < 0.01) {
          throw new Error(`Monto total debe ser al menos 0.01: ${estimatedFare}`);
        }

        // Ensure it's a valid number with proper formatting
        const validatedTotalAmount = parseFloat(Number(estimatedFare).toFixed(2));
        if (isNaN(validatedTotalAmount)) {
          throw new Error(`Monto total no es un número válido: ${estimatedFare}`);
        }

        if (!Array.isArray(paymentMethods) || paymentMethods.length === 0) {
          throw new Error("No hay métodos de pago configurados");
        }

        // Validate each payment method
        for (const payment of paymentMethods) {
          if (!payment.method || typeof payment.method !== 'string') {
            throw new Error(`Método de pago inválido: ${JSON.stringify(payment)}`);
          }
          const amountNum = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
          if (!payment.amount || isNaN(amountNum) || amountNum <= 0) {
            throw new Error(`Monto de pago inválido: ${JSON.stringify(payment)}`);
          }
        }

        // Try alternative payload structure - backend might expect different format
        const paymentPayload = {
          totalAmount: validatedTotalAmount, // Send as number
          payments: paymentMethods,
        };

        // Alternative: Maybe backend expects just the payments array directly?
        // Let's try both approaches and see which one works
        const alternativePayload = paymentMethods;

        // For now, send only the correct payload format
        const result = await paymentStore.payRideWithMultipleMethods(id, paymentPayload);

        if (result.data.status === "complete") {
          showSuccess(
            "¡Pago completado!",
            "Ahora buscaremos un conductor para ti",
          );
        } else {
          // Mostrar referencias bancarias
          showSuccess(
            "¡Pagos configurados!",
            `Generadas ${result.data.references?.length || 0} referencias bancarias`,
          );
        }
      }

      // Continuar con el flujo de matching
      next();
    } catch (error: any) {
      console.error("[PaymentMethodology] Payment confirmation error:", error);
      const errorMessage = error?.message || "Error al procesar el pago";
      showError("Error de pago", errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Componente Modal para agregar/editar métodos de pago
  const AddPaymentModal = () => {
    const [selectedMethod, setSelectedMethod] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    React.useEffect(() => {
      setSelectedMethod("");
      setAmount("");
      setDescription("");
    }, []);

    const handleSave = () => {
      if (!selectedMethod || !amount) return;

      const paymentAmount = parseFloat(amount);
      // Map frontend method names to backend method types
      let methodType: "cash" | "card" | "wallet";
      let bankCode: string | undefined;

      switch (selectedMethod) {
        case "Cash":
          methodType = "cash";
          break;
        case "Credit Card":
        case "Debit Card":
        case "Bank Transfer":
          methodType = "card";
          // For bank transfers, we'll need to ask for bank code later
          // For now, use a default or ask user to select
          bankCode = selectedMethod === "Bank Transfer" ? "0102" : undefined;
          break;
        case "Digital Wallet":
          methodType = "wallet";
          break;
        default:
          methodType = "cash";
      }

      const newPayment: SplitPayment = {
        id: `payment_${Date.now()}`,
        method: methodType,
        amount: paymentAmount,
        percentage: estimatedFare > 0 ? (paymentAmount / estimatedFare) * 100 : 0,
        bankCode: bankCode,
        description: description || `Pago con ${selectedMethod}`,
        status: "pending" as const,
      };

      setMultiplePayments((prev) => [...prev, newPayment]);
      setShowAddModal(false);
      setSelectedMethod("");
      setAmount("");
      setDescription("");
    };

    return (
      <Modal visible={showAddModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-xl p-6">
            <Text className="font-JakartaBold text-lg mb-4">
              Agregar método de pago
            </Text>

            <Text className="font-JakartaMedium mb-2">Método:</Text>
            <View className="flex-row flex-wrap mb-4">
              {[
                "Credit Card",
                "Debit Card",
                "Cash",
                "Bank Transfer",
                "Digital Wallet",
              ].map((method) => (
                <TouchableOpacity
                  key={method}
                  onPress={() => setSelectedMethod(method)}
                  className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                    selectedMethod === method
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-300"
                  }`}
                >
                  <Text
                    className={
                      selectedMethod === method
                        ? "text-primary-600"
                        : "text-gray-600"
                    }
                  >
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="font-JakartaMedium mb-2">Monto:</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              className="bg-gray-50 rounded-lg px-4 py-3 mb-4 font-Jakarta"
              placeholderTextColor="#9CA3AF"
            />

            <Text className="font-JakartaMedium mb-2">
              Descripción (opcional):
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Descripción del pago"
              className="bg-gray-50 rounded-lg px-4 py-3 mb-6 font-Jakarta"
              placeholderTextColor="#9CA3AF"
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setSelectedMethod("");
                  setAmount("");
                  setDescription("");
                }}
                className="flex-1 bg-gray-300 rounded-lg py-3"
              >
                <Text className="text-center font-JakartaMedium">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 bg-primary-500 rounded-lg py-3"
              >
                <Text className="text-center font-JakartaMedium text-white">
                  Agregar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View className="flex-1">
      <FlowHeader
        title="Método de Pago"
        subtitle="Selecciona cómo deseas pagar tu viaje"
        onBack={back}
      />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5">
          {/* Resumen del viaje */}
          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <Text className="font-JakartaBold text-lg text-gray-800 mb-2">
              Resumen del viaje
            </Text>
            <View className="flex-row justify-between items-center">
              <Text className="font-Jakarta text-gray-600">
                Distancia estimada
              </Text>
              <Text className="font-JakartaMedium text-gray-800">
                {routeInfo ? `${routeInfo.distanceMiles.toFixed(1)} millas` : 'Calculando...'}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mt-1">
              <Text className="font-Jakarta text-gray-600">
                Tiempo estimado
              </Text>
              <Text className="font-JakartaMedium text-gray-800">
                {routeInfo ? `${routeInfo.durationMinutes} min` : 'Calculando...'}
              </Text>
            </View>
            <View className="border-t border-gray-200 mt-3 pt-3">
              <View className="flex-row justify-between items-center">
                <Text className="font-JakartaBold text-lg text-gray-800">
                  Total
                </Text>
                <Text className="font-JakartaBold text-xl text-primary-600">
                  ${estimatedFare.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Wallet Balance Indicator */}
          {hasWallet && balance && (
            <WalletBalanceIndicator
              balance={balance.amount}
              currency={balance.currency}
              onRecargar={() => {
                // TODO: Navigate to wallet recharge screen
                showSuccess("Funcionalidad próximamente", "Recarga de wallet estará disponible pronto");
              }}
            />
          )}

          {/* Payment Tabs */}
          <View className="flex-row mb-4 bg-gray-100 rounded-lg p-1">
            <TouchableOpacity
              onPress={() => handlePaymentModeChange("single")}
              className={`flex-1 py-2 px-4 rounded-md ${
                paymentMode === "single" ? "bg-white shadow-sm" : ""
              }`}
            >
              <Text
                className={`text-center font-JakartaMedium ${
                  paymentMode === "single" ? "text-gray-800" : "text-gray-600"
                }`}
              >
                Pago único
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handlePaymentModeChange("multiple")}
              className={`flex-1 py-2 px-4 rounded-md ${
                paymentMode === "multiple" ? "bg-white shadow-sm" : ""
              }`}
            >
              <Text
                className={`text-center font-JakartaMedium ${
                  paymentMode === "multiple" ? "text-gray-800" : "text-gray-600"
                }`}
              >
                Pago múltiple
              </Text>
            </TouchableOpacity>
          </View>

          {/* Payment Content */}
          {paymentMode === "single" ? (
            <View className="mb-6">
              <Text className="font-JakartaMedium text-gray-700 mb-3">
                Selecciona tu método de pago preferido
              </Text>
              <PaymentMethodSelector
                selectedMethodId={paymentMethod}
                onSelectMethod={handlePaymentMethodChange}
                className="mb-4"
                showWalletBalance={hasWallet}
                walletBalance={balance?.amount || 0}
                walletCurrency={balance?.currency || "VES"}
                hasSufficientWalletBalance={hasSufficientBalance(estimatedFare)}
              />

              {/* Mostrar BankSelector si el método requiere código bancario */}
              {paymentValidation.requiresBankCode && (
                <BankSelector
                  selectedBankCode={bankCode}
                  onBankSelect={setBankCode}
                  paymentMethod={paymentMethod}
                />
              )}

              {/* Mostrar mensaje de error si faltan datos requeridos */}
              {paymentMethod && !paymentValidation.isValid && paymentValidation.error && (
                <View className="bg-red-50 rounded-lg p-3 mt-2">
                  <Text className="font-JakartaMedium text-red-800 text-sm">
                    ⚠️ {paymentValidation.error}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="mb-6">
              <Text className="font-JakartaMedium text-gray-700 mb-3">
                Configura múltiples métodos de pago
              </Text>

              {multiplePayments.map((payment, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between bg-gray-50 rounded-lg p-3 mb-2"
                >
                  <View className="flex-1">
                    <Text className="font-JakartaMedium">{payment.method}</Text>
                    <Text className="font-Jakarta text-sm text-gray-600">
                      ${payment.amount.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setMultiplePayments((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                    className="p-1"
                  >
                    <Text className="text-red-500 text-lg font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                className="flex-row items-center justify-center bg-gray-100 rounded-lg p-3 border-2 border-dashed border-gray-300"
              >
                <Text className="text-gray-600 mr-2">+</Text>
                <Text className="text-gray-600 font-JakartaMedium">
                  Agregar método de pago
                </Text>
              </TouchableOpacity>

              {multiplePayments && Array.isArray(multiplePayments) && multiplePayments.length > 0 && (
                <View className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <Text className="font-JakartaMedium text-blue-800">
                    Total configurado: $
                    {multiplePayments
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          )}

        </View>
      </ScrollView>

      {/* Action Button */}
      <View className="px-5 pb-4">
        <TouchableOpacity
          disabled={!canContinue}
          onPress={handlePaymentConfirmation}
          className={`rounded-xl p-4 ${canContinue ? "bg-primary-500" : "bg-gray-300"}`}
          activeOpacity={0.8}
        >
          <Text className="text-white font-JakartaBold text-center">
            {isProcessingPayment
              ? "Procesando..."
              : paymentMode === "single"
                ? "Pagar y buscar conductor"
                : "Configurar pagos y buscar conductor"}
          </Text>
          <Text className="text-white/80 font-JakartaMedium text-sm text-center mt-1">
            💳 ${estimatedFare.toFixed(2)} • 🔍 Matching automático
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <AddPaymentModal />
    </View>
  );
};

export default PaymentMethodology;
