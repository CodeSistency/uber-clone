import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { Button, TextField, Card } from "@/components/ui";
import { errandClient } from "@/app/services/flowClientService";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import {
  mapPaymentMethodToAPI,
  validatePaymentMethod,
} from "@/lib/paymentValidation";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";

import FlowHeader from "../../../FlowHeader";

const MandadoPriceAndPayment: React.FC = () => {
  const { back, goTo, setErrandId } = useMapFlow() as any;
  const { withUI } = useUI();
  const [estimate, setEstimate] = React.useState<number>(7.75);
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>(null);

  const paymentValidation = validatePaymentMethod(paymentMethod || "");
  const canPay = paymentValidation.isValid;

  return (
    <View className="flex-1">
      <FlowHeader
        title="Precio estimado y pago"
        subtitle="Confirma el servicio de mandado"
        onBack={back}
      />

      <View className="px-5 mt-4">
        <Card className="bg-white">
          <Text className="font-JakartaMedium text-gray-700">
            Estimado del servicio
          </Text>
          <Text className="font-JakartaBold text-2xl text-gray-800 mt-1">
            $ {estimate.toFixed(2)}
          </Text>
          <Text className="font-Jakarta text-gray-500 mt-1">
            (No incluye costo de productos)
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
          title="Pagar y buscar conductor"
          onPress={async () => {
            const res = await withUI(
              () =>
                errandClient.create({
                  description: "Demo",
                  pickupAddress: "A",
                  pickupLat: 10.5,
                  pickupLng: -66.9,
                  dropoffAddress: "B",
                  dropoffLat: 10.49,
                  dropoffLng: -66.91,
                }),
              { loadingMessage: "Creando mandado..." },
            );
            const id = res?.data?.id || res?.id;
            if (id) {
              setErrandId(id);
              // Confirmar pago después de crear el mandado
              const paymentData = mapPaymentMethodToAPI(paymentMethod!);
              await withUI(() => errandClient.confirmPayment(id, paymentData), {
                loadingMessage: "Confirmando pago...",
              });
            }
            goTo(FLOW_STEPS.CUSTOMER_MANDADO_BUSCANDO_CONDUCTOR);
          }}
          disabled={!canPay}
          className="rounded-xl p-4"
        />
      </View>
    </View>
  );
};

export default MandadoPriceAndPayment;
