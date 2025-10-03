import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { Button, TextField, Card } from "@/components/ui";
import { parcelClient } from "@/app/services/flowClientService";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import {
  mapPaymentMethodToAPI,
  validatePaymentMethod,
} from "@/lib/paymentValidation";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";

import FlowHeader from "../../../FlowHeader";

const EnvioPricingAndPayment: React.FC = () => {
  const { back, goTo, parcelId } = useMapFlow() as any;
  const { withUI } = useUI();
  const [price, setPrice] = React.useState<number>(12.5);
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>(null);

  const paymentValidation = validatePaymentMethod(paymentMethod || "");
  const canPay = paymentValidation.isValid;

  return (
    <View className="flex-1">
      <FlowHeader
        title="Precio y pago"
        subtitle="Confirma el precio y el método de pago"
        onBack={back}
      />

      <View className="px-5 mt-4">
        <Card className="bg-white">
          <Text className="font-JakartaMedium text-gray-700">
            Precio estimado
          </Text>
          <Text className="font-JakartaBold text-2xl text-gray-800 mt-1">
            $ {price.toFixed(2)}
          </Text>
          <Text className="font-Jakarta text-gray-500 mt-1">
            Basado en distancia, tamaño y peso
          </Text>
        </Card>
      </View>

      <PaymentMethodSelector
        selectedMethodId={paymentMethod}
        onSelectMethod={setPaymentMethod}
        className="mt-4"
      />

      <View className="px-5 pb-4 mt-2">
        <Button
          variant={canPay ? "primary" : "secondary"}
          title="Pagar e iniciar envío"
          onPress={async () => {
            const id = parcelId || 401;
            // Confirmar pago antes de unirse al tracking
            const paymentData = mapPaymentMethodToAPI(paymentMethod!);
            await withUI(() => parcelClient.confirmPayment(id, paymentData), {
              loadingMessage: "Confirmando pago...",
            });
            await withUI(() => parcelClient.join(id), {
              loadingMessage: "Uniéndote al tracking...",
            });
            goTo(FLOW_STEPS.CUSTOMER_ENVIO_SEGUIMIENTO_PAQUETE);
          }}
          disabled={!canPay}
          className="rounded-xl p-4"
        />
      </View>
    </View>
  );
};

export default EnvioPricingAndPayment;
