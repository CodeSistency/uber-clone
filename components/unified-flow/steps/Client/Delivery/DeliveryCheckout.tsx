import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";

import { Button, TextField, Card } from "@/components/ui";
import { deliveryClient } from "@/app/services/flowClientService";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import {
  mapPaymentMethodToAPI,
  validatePaymentMethod,
} from "@/lib/paymentValidation";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";

import FlowHeader from "../../../FlowHeader";

const DeliveryCheckout: React.FC = () => {
  const { back, goTo, orderId } = useMapFlow() as any;
  const { withUI } = useUI();
  const [address, setAddress] = React.useState("");
  const [instructions, setInstructions] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>(null);

  const paymentValidation = validatePaymentMethod(paymentMethod || "");
  const canConfirm = address.trim().length > 5 && paymentValidation.isValid;

  return (
    <View className="flex-1">
      <FlowHeader
        title="Checkout"
        subtitle="Confirma dirección y método de pago"
        onBack={back}
      />

      <View className="px-5">
        <TextField
          label="Dirección de entrega"
          value={address}
          onChangeText={setAddress}
          placeholder="Calle, número, referencia"
          className="mb-4"
        />

        <TextField
          label="Instrucciones"
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Detalles para el repartidor"
          className="mb-4"
          multiline
        />
      </View>

      <PaymentMethodSelector
        selectedMethodId={paymentMethod}
        onSelectMethod={setPaymentMethod}
        className="mt-1"
      />

      <View className="px-5 pb-4">
        <Button
          variant={canConfirm ? "primary" : "secondary"}
          title="Confirmar pedido"
          onPress={async () => {
            const id = orderId || 201;
            const paymentData = mapPaymentMethodToAPI(paymentMethod!);
            await withUI(() => deliveryClient.confirmPayment(id, paymentData), {
              loadingMessage: "Confirmando pago...",
            });
            await withUI(() => deliveryClient.join(id), {
              loadingMessage: "Uniéndote al tracking...",
            });
            goTo(FLOW_STEPS.CUSTOMER_DELIVERY_SEGUIMIENTO_DELIVERY);
          }}
          disabled={!canConfirm}
          className="rounded-xl p-4"
        />
      </View>
    </View>
  );
};

export default DeliveryCheckout;
