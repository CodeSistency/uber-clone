import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput } from "react-native";

import { transportClient } from "@/app/services/flowClientService";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore, useDriverStore, usePaymentStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";
import { mapPaymentMethodToAPI, validatePaymentMethod, SplitPayment, createSplitPayment } from "@/lib/paymentValidation";

import FlowHeader from "../../FlowHeader";

const DriverConfirmation: React.FC = () => {
  const { back, goTo, rideId } = useMapFlow() as any;
  const { withUI, showSuccess, showError } = useUI();
  const { rideStatus } = useRealtimeStore();
  const { drivers, selectedDriver } = useDriverStore();
  const paymentStore = usePaymentStore();

  // Estados de pago
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [multiplePayments, setMultiplePayments] = useState<SplitPayment[]>([]);
  const [paymentMode, setPaymentMode] = useState<"single" | "multiple">("single");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<SplitPayment | null>(null);

  // Monto estimado del viaje
  const estimatedFare = 25.50;

  // Validaciones
  const paymentValidation = validatePaymentMethod(paymentMethod || "");
  const canContinue = selectedDriver !== null && !isProcessingPayment &&
    (paymentMode === "single" ? paymentValidation.isValid : multiplePayments.length > 0);

  const driver = React.useMemo(
    () => drivers.find((d) => d.id === selectedDriver) || null,
    [drivers, selectedDriver],
  );

  // Función para manejar cambio de modo de pago
  const handlePaymentModeChange = (newMode: "single" | "multiple") => {
    setPaymentMode(newMode);

    // Resetear estados cuando cambie el modo
    if (newMode === "single") {
      setMultiplePayments([]);
    } else {
      setPaymentMethod(null);
    }

    console.log("[DriverConfirmation] Payment mode changed to:", newMode);
  };

  // Función para manejar la confirmación de pagos
  const handlePaymentConfirmation = async () => {
    if (!canContinue) return;

    const id = rideId || 101;
    setIsProcessingPayment(true);

    try {
      // Confirmar pago según el modo seleccionado
      if (paymentMode === "single") {
        // Pago único tradicional
        const paymentData = mapPaymentMethodToAPI(paymentMethod!);
        await withUI(
          () => transportClient.confirmPayment(id, paymentData),
          { loadingMessage: "Confirmando pago..." }
        );

        showSuccess("¡Pago confirmado!", "Tu conductor está en camino");
      } else {
        // Pago múltiple nuevo
        if (multiplePayments.length === 0) {
          throw new Error("No se han configurado pagos múltiples");
        }

        console.log("[DriverConfirmation] Processing multiple payments:", multiplePayments);

        // Convertir SplitPayment a PaymentMethod para la API
        const paymentMethods = multiplePayments.map(payment => ({
          method: payment.method,
          amount: payment.amount,
          bankCode: payment.bankCode,
          description: payment.description,
        }));

        // Crear grupo de pagos múltiples
        const paymentGroup = await paymentStore.createPaymentGroup({
          serviceType: "ride",
          serviceId: id,
          totalAmount: estimatedFare,
          payments: paymentMethods,
        });

        if (paymentGroup.success) {
          showSuccess(
            "¡Pagos configurados!",
            `Grupo ${paymentGroup.groupId} creado con ${multiplePayments.length} métodos`
          );

          console.log("[DriverConfirmation] Payment group created:", paymentGroup.groupId);
        } else {
          throw new Error("Error al crear grupo de pagos");
        }
      }

      // Continuar con el flujo
      goTo(FLOW_STEPS.CUSTOMER_TRANSPORT.DURANTE_FINALIZACION);

    } catch (error: any) {
      console.error("[DriverConfirmation] Payment confirmation error:", error);
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
      if (editingMethod) {
        setSelectedMethod(editingMethod.method);
        setAmount(editingMethod.amount.toString());
        setDescription(editingMethod.description || "");
      } else {
        setSelectedMethod("");
        setAmount("");
        setDescription("");
      }
    }, [editingMethod]);

    const handleSave = () => {
      if (!selectedMethod || !amount) return;

      const paymentAmount = parseFloat(amount);
      const newPayment: SplitPayment = {
        id: editingMethod ? editingMethod.id : `payment_${Date.now()}`,
        method: selectedMethod as "cash" | "card" | "wallet",
        amount: paymentAmount,
        percentage: (paymentAmount / estimatedFare) * 100,
        bankCode: selectedMethod === "bank_transfer" ? "001" : undefined,
        description: description || `Pago con ${selectedMethod}`,
        status: "pending" as const,
      };

      if (editingMethod) {
        // Edit existing payment
        setMultiplePayments(prev =>
          prev.map(p => p === editingMethod ? newPayment : p)
        );
      } else {
        // Add new payment
        setMultiplePayments(prev => [...prev, newPayment]);
      }

      setShowAddModal(false);
      setEditingMethod(null);
      setSelectedMethod("");
      setAmount("");
      setDescription("");
    };

    const handleDelete = () => {
      if (editingMethod) {
        setMultiplePayments(prev => prev.filter(p => p !== editingMethod));
        setShowAddModal(false);
        setEditingMethod(null);
      }
    };

    return (
      <Modal visible={showAddModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-xl p-6">
            <Text className="font-JakartaBold text-lg mb-4">
              {editingMethod ? "Editar método de pago" : "Agregar método de pago"}
            </Text>

            <Text className="font-JakartaMedium mb-2">Método:</Text>
            <View className="flex-row flex-wrap mb-4">
              {["Credit Card", "Debit Card", "Cash", "Bank Transfer", "Digital Wallet"].map((method) => (
                <TouchableOpacity
                  key={method}
                  onPress={() => setSelectedMethod(method)}
                  className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                    selectedMethod === method ? "border-primary-500 bg-primary-50" : "border-gray-300"
                  }`}
                >
                  <Text className={selectedMethod === method ? "text-primary-600" : "text-gray-600"}>
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

            <Text className="font-JakartaMedium mb-2">Descripción (opcional):</Text>
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
                  setEditingMethod(null);
                  setSelectedMethod("");
                  setAmount("");
                  setDescription("");
                }}
                className="flex-1 bg-gray-300 rounded-lg py-3"
              >
                <Text className="text-center font-JakartaMedium">Cancelar</Text>
              </TouchableOpacity>
              {editingMethod && (
                <TouchableOpacity
                  onPress={handleDelete}
                  className="flex-1 bg-red-500 rounded-lg py-3"
                >
                  <Text className="text-center font-JakartaMedium text-white">Eliminar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 bg-primary-500 rounded-lg py-3"
              >
                <Text className="text-center font-JakartaMedium text-white">
                  {editingMethod ? "Guardar" : "Agregar"}
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
        title="Conductor en camino"
        subtitle={
          driver
            ? `${driver.first_name} ${driver.last_name} está en camino a tu ubicación`
            : "Buscando conductor..."
        }
        onBack={back}
      />

      {/* Driver Card */}
      <View className="px-5 py-4">
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="font-JakartaBold text-lg text-gray-800 mb-2">
            Detalles del conductor
          </Text>
          {driver ? (
            <>
              <Text className="font-JakartaMedium text-gray-700">
                {driver.first_name} {driver.last_name}
              </Text>
              <Text className="font-Jakarta text-gray-600 mt-1">
                {driver.title || "Básico"} • {driver.car_seats} asientos
              </Text>
              <Text className="font-Jakarta text-gray-600">
                ⭐ 4.6 ({(driver as any).rides_count || 0} viajes)
              </Text>
              <Text className="font-Jakarta text-gray-600">
                📞 +57 300 123 4567 • ⏱️ ETA: {driver.time ? `${driver.time} min` : "—"}
              </Text>
            </>
          ) : (
            <Text className="font-Jakarta text-gray-600">
              Asignando conductor...
            </Text>
          )}
        </View>
      </View>

      {/* Status Card */}
      <View className="px-5">
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <Text className="font-JakartaMedium text-gray-700">
            Estado del viaje
          </Text>
          <Text className="font-JakartaBold text-gray-800 mt-1">
            {String(rideStatus || "accepted").replace(/_/g, " ")}
          </Text>
          <Text className="font-Jakarta text-gray-600 mt-1">
            El conductor se dirige a tu origen. Te notificaremos cuando llegue.
          </Text>
        </View>
      </View>

      {/* Payment Card */}
      <View className="px-5">
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <Text className="font-JakartaBold text-lg text-gray-800 mb-4">
            Método de Pago
          </Text>

          {/* Payment Tabs */}
          <View className="flex-row mb-4 bg-gray-100 rounded-lg p-1">
            <TouchableOpacity
              onPress={() => handlePaymentModeChange("single")}
              className={`flex-1 py-2 px-4 rounded-md ${
                paymentMode === "single" ? "bg-white shadow-sm" : ""
              }`}
            >
              <Text className={`text-center font-JakartaMedium ${
                paymentMode === "single"
                  ? "text-gray-800"
                  : "text-gray-600"
              }`}>
                Pago
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handlePaymentModeChange("multiple")}
              className={`flex-1 py-2 px-4 rounded-md ${
                paymentMode === "multiple" ? "bg-white shadow-sm" : ""
              }`}
            >
              <Text className={`text-center font-JakartaMedium ${
                paymentMode === "multiple"
                  ? "text-gray-800"
                  : "text-gray-600"
              }`}>
                Pago Múltiple
              </Text>
            </TouchableOpacity>
          </View>

          {/* Payment Content */}
          {paymentMode === "single" ? (
            <PaymentMethodSelector
              selectedMethodId={paymentMethod}
              onSelectMethod={setPaymentMethod}
              className="mb-4"
            />
          ) : (
            <View>
              {multiplePayments.map((payment, index) => (
                <View key={index} className="flex-row items-center justify-between bg-gray-50 rounded-lg p-3 mb-2">
                  <View className="flex-1">
                    <Text className="font-JakartaMedium">{payment.method}</Text>
                    <Text className="font-Jakarta text-sm text-gray-600">${payment.amount.toFixed(2)}</Text>
                  </View>
                  <View className="flex-row space-x-2">
                    <TouchableOpacity
                      onPress={() => {
                        setEditingMethod(payment);
                        setShowAddModal(true);
                      }}
                      className="p-1"
                    >
                      <Text className="text-blue-500 text-lg">✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setMultiplePayments(prev => prev.filter((_, i) => i !== index))}
                      className="p-1"
                    >
                      <Text className="text-red-500 text-lg">🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => {
                  setEditingMethod(null);
                  setShowAddModal(true);
                }}
                className="flex-row items-center justify-center bg-gray-100 rounded-lg p-3 border-2 border-dashed border-gray-300"
              >
                <Text className="text-gray-600 mr-2">+</Text>
                <Text className="text-gray-600 font-JakartaMedium">Agregar método de pago</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="mt-4 pt-4 border-t border-gray-200">
            <Text className="font-JakartaBold text-lg text-gray-800">
              Total: ${estimatedFare.toFixed(2)}
            </Text>
            <Text className="font-Jakarta text-sm text-gray-600">
              Tiempo estimado: 25 min
            </Text>
          </View>
        </View>
      </View>

      {/* Route Card */}
      <View className="px-5">
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <Text className="font-JakartaBold text-lg text-gray-800 mb-2">
            Ruta del viaje
          </Text>
          <Text className="font-Jakarta text-gray-600">📍 Origen: Calle 123, Bogotá</Text>
          <Text className="font-Jakarta text-gray-600">�� Destino: Carrera 45, Medellín</Text>
          <Text className="font-Jakarta text-gray-600">�� Distancia: 15.2 km</Text>
        </View>
      </View>

      {/* Action Button */}
      <View className="px-5 pb-4">
        <TouchableOpacity
          disabled={!canContinue}
          onPress={handlePaymentConfirmation}
          className={`rounded-xl p-4 ${canContinue ? "bg-primary-500" : "bg-gray-300"}`}
          activeOpacity={0.8}
        >
          <Text className="text-white font-JakartaBold text-center">
            {isProcessingPayment ? "Procesando..." : "Iniciar viaje"}
          </Text>
          <Text className="text-white/80 font-JakartaMedium text-sm text-center mt-1">
            💳 ${estimatedFare.toFixed(2)} • ⏱️ 25 min
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <AddPaymentModal />
    </View>
  );
};

export default DriverConfirmation;
