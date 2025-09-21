import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

import { parcelClient } from "@/app/services/flowClientService";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

import FlowHeader from "../../../FlowHeader";

const EnvioDetails: React.FC = () => {
  const { back, goTo, setParcelId } = useMapFlow() as any;
  const { withUI } = useUI();
  const [origin, setOrigin] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [packageType, setPackageType] = React.useState("documentos");
  const [size, setSize] = React.useState("pequeño");
  const [weight, setWeight] = React.useState("liviano");
  const [description, setDescription] = React.useState("");

  const canContinue = origin.trim().length > 5 && destination.trim().length > 5;

  return (
    <View className="flex-1">
      <FlowHeader
        title="Detalles del envío"
        subtitle="Completa la información del paquete y direcciones"
        onBack={back}
      />

      <View className="px-5">
        <Text className="font-JakartaMedium text-sm text-gray-600 mb-2">
          Dirección de origen
        </Text>
        <TextInput
          value={origin}
          onChangeText={setOrigin}
          placeholder="Calle, número, referencia"
          className="bg-white rounded-xl p-4 border border-gray-200 mb-4"
        />

        <Text className="font-JakartaMedium text-sm text-gray-600 mb-2">
          Dirección de destino
        </Text>
        <TextInput
          value={destination}
          onChangeText={setDestination}
          placeholder="Calle, número, referencia"
          className="bg-white rounded-xl p-4 border border-gray-200 mb-4"
        />

        <Text className="font-JakartaMedium text-sm text-gray-600 mb-2">
          Tipo de paquete
        </Text>
        <TextInput
          value={packageType}
          onChangeText={setPackageType}
          className="bg-white rounded-xl p-4 border border-gray-200 mb-4"
        />

        <View className="flex-row">
          <View className="flex-1 mr-2">
            <Text className="font-JakartaMedium text-sm text-gray-600 mb-2">
              Tamaño
            </Text>
            <TextInput
              value={size}
              onChangeText={setSize}
              className="bg-white rounded-xl p-4 border border-gray-200"
            />
          </View>
          <View className="flex-1 ml-2">
            <Text className="font-JakartaMedium text-sm text-gray-600 mb-2">
              Peso
            </Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              className="bg-white rounded-xl p-4 border border-gray-200"
            />
          </View>
        </View>

        <Text className="font-JakartaMedium text-sm text-gray-600 mt-4 mb-2">
          Descripción
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Detalles del paquete"
          className="bg-white rounded-xl p-4 border border-gray-200"
          multiline
        />
      </View>

      <View className="px-5 pb-4 mt-4">
        <TouchableOpacity
          disabled={!canContinue}
          onPress={async () => {
            const res = await withUI(
              () =>
                parcelClient.create({
                  pickupAddress: origin,
                  pickupLat: 10.5,
                  pickupLng: -66.9,
                  dropoffAddress: destination,
                  dropoffLat: 10.49,
                  dropoffLng: -66.91,
                  type: packageType,
                  description,
                }),
              { loadingMessage: "Creando envío..." },
            );
            const id = res?.data?.id || res?.id;
            if (id) setParcelId(id);
            goTo(FLOW_STEPS.CUSTOMER_ENVIO.CALCULAR_PRECIO);
          }}
          className={`rounded-xl p-4 ${canContinue ? "bg-primary-500" : "bg-gray-300"}`}
        >
          <Text className="text-white font-JakartaBold text-center">
            Calcular precio
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EnvioDetails;
