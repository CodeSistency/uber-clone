import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

import { Button, TextField, Card } from "@/components/ui";
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
        <TextField
          label="Dirección de origen"
          value={origin}
          onChangeText={setOrigin}
          placeholder="Calle, número, referencia"
          className="mb-4"
        />

        <TextField
          label="Dirección de destino"
          value={destination}
          onChangeText={setDestination}
          placeholder="Calle, número, referencia"
          className="mb-4"
        />

        <TextField
          label="Tipo de paquete"
          value={packageType}
          onChangeText={setPackageType}
          className="mb-4"
        />

        <View className="flex-row">
          <View className="flex-1 mr-2">
            <TextField
              label="Tamaño"
              value={size}
              onChangeText={setSize}
            />
          </View>
          <View className="flex-1 ml-2">
            <TextField
              label="Peso"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        </View>

        <TextField
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          placeholder="Detalles del paquete"
          className="mt-4"
          multiline
        />
      </View>

      <View className="px-5 pb-4 mt-4">
        <Button
          variant={canContinue ? "primary" : "secondary"}
          title="Calcular precio"
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
          disabled={!canContinue}
          className="rounded-xl p-4"
        />
      </View>
    </View>
  );
};

export default EnvioDetails;
