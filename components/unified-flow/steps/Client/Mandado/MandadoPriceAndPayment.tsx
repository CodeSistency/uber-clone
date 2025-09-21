import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { errandClient } from "@/app/services/flowClientService";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";
import { mapPaymentMethodToAPI, validatePaymentMethod } from "@/lib/paymentValidation";

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
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="font-JakartaMedium text-gray-700">
            Estimado del servicio
          </Text>
          <Text className="font-JakartaBold text-2xl text-gray-800 mt-1">
            $ {estimate.toFixed(2)}
          </Text>
          <Text className="font-Jakarta text-gray-500 mt-1">
            (No incluye costo de productos)
          </Text>
        </View>
      </View>

      <PaymentMethodSelector
        selectedMethodId={paymentMethod}
        onSelectMethod={setPaymentMethod}
        className="mt-4"
      />

      <View className="px-5 pb-4 mt-2">
        <TouchableOpacity
          disabled={!canPay}
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
              await withUI(
                () => errandClient.confirmPayment(id, paymentData),
                { loadingMessage: "Confirmando pago..." }
              );
            }
            goTo(FLOW_STEPS.CUSTOMER_MANDADO.BUSCANDO_CONDUCTOR);
          }}
          className={`rounded-xl p-4 ${canPay ? "bg-primary-500" : "bg-gray-300"}`}
        >
          <Text className="text-white font-JakartaBold text-center">
            Pagar y buscar conductor
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MandadoPriceAndPayment;
