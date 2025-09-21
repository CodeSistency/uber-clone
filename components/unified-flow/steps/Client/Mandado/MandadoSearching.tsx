import React from "react";
import { View, Text } from "react-native";

import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

import FlowHeader from "../../../FlowHeader";

const MandadoSearching: React.FC = () => {
  const { back, goTo } = useMapFlow();
  const { showInfo } = useUI();

  React.useEffect(() => {
    const t = setTimeout(() => {
      showInfo(
        "Conductor asignado",
        "Se encontró un conductor para tu mandado",
      );
      goTo(FLOW_STEPS.CUSTOMER_MANDADO.COMUNICACION_CONFIRMACION);
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <View className="flex-1">
      <FlowHeader
        title="Buscando conductor"
        subtitle="Esto puede tardar unos segundos"
        onBack={back}
      />

      <View className="items-center justify-center flex-1">
        <Text className="text-6xl mb-3">⌛</Text>
        <Text className="font-JakartaMedium text-gray-700">Buscando...</Text>
      </View>
    </View>
  );
};

export default MandadoSearching;




