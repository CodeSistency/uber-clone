import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";

import { deliveryClient } from "@/app/services/flowClientService";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";
import { mapPaymentMethodToAPI, validatePaymentMethod } from "@/lib/paymentValidation";

import FlowHeader from "../../../FlowHeader";

const DeliveryCheckout: React.FC = () => {
  const { back, goTo, orderId } = useMapFlow() as any;
  const { withUI } = useUI();
  const [address, setAddress] = React.useState("");
  const [instructions, setInstructions] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>(null);

  const paymentValidation = validatePaymentMethod(paymentMethod || "");
  const canConfirm =
    address.trim().length > 5 && paymentValidation.isValid;

  return (
    <View className="flex-1">
      <FlowHeader
        title="Checkout"
        subtitle="Confirma dirección y método de pago"
        onBack={back}
      />

      <View className="px-5">
        <Text className="font-JakartaMedium text-sm text-gray-600 mb-2">
          Dirección de entrega
        </Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Calle, número, referencia"
          className="bg-white rounded-xl p-4 border border-gray-200 mb-4"
        />

        <Text className="font-JakartaMedium text-sm text-gray-600 mb-2">
          Instrucciones
        </Text>
        <TextInput
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Detalles para el repartidor"
          className="bg-white rounded-xl p-4 border border-gray-200 mb-4"
          multiline
        />
      </View>

      <PaymentMethodSelector
        selectedMethodId={paymentMethod}
        onSelectMethod={setPaymentMethod}
        className="mt-1"
      />

      <View className="px-5 pb-4">
        <TouchableOpacity
          disabled={!canConfirm}
          onPress={async () => {
            const id = orderId || 201;
            const paymentData = mapPaymentMethodToAPI(paymentMethod!);
            await withUI(
              () => deliveryClient.confirmPayment(id, paymentData),
              { loadingMessage: "Confirmando pago..." },
            );
            await withUI(() => deliveryClient.join(id), {
              loadingMessage: "Uniéndote al tracking...",
            });
            goTo(FLOW_STEPS.CUSTOMER_DELIVERY.SEGUIMIENTO_DELIVERY);
          }}
          className={`rounded-xl p-4 ${canConfirm ? "bg-primary-500" : "bg-gray-300"}`}
        >
          <Text className="text-white font-JakartaBold text-center">
            Confirmar pedido
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DeliveryCheckout;
