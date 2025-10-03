import React, { useEffect, useState } from "react";
import { Alert, Modal, TouchableOpacity, View, Text } from "react-native";

import { Button, TextField, Card } from "@/components/ui";

export interface EmergencyContactData {
  name: string;
  phone: string;
  relationship: string;
}

interface EmergencyContactModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (contact: EmergencyContactData) => void;
  onRemove?: () => void;
  initialContact?: EmergencyContactData | null;
}

export const EmergencyContactModal: React.FC<EmergencyContactModalProps> = ({
  visible,
  onClose,
  onSave,
  onRemove,
  initialContact,
}) => {
  const [name, setName] = useState(initialContact?.name || "");
  const [phone, setPhone] = useState(initialContact?.phone || "");
  const [relationship, setRelationship] = useState(
    initialContact?.relationship || "",
  );

  useEffect(() => {
    if (visible) {
      setName(initialContact?.name || "");
      setPhone(initialContact?.phone || "");
      setRelationship(initialContact?.relationship || "");
    }
  }, [visible, initialContact]);

  const handleSave = () => {
    if (!name || !phone || !relationship) {
      Alert.alert(
        "Completa la información",
        "Ingresa nombre, teléfono y relación para guardar el contacto.",
      );
      return;
    }

    onSave({ name, phone, relationship });
    onClose();
  };

  const handleRemove = () => {
    onRemove?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/40"
      />

      <View className="absolute left-0 right-0 bottom-0 bg-white dark:bg-brand-primary rounded-t-3xl p-6">
        <Card
          variant="ghost"
          padding="none"
          className="space-y-4"
          header={
            <View>
              <Text className="text-xl font-Jakarta-Bold text-gray-900 dark:text-white">
                Contacto de emergencia
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                Comparte a alguien de confianza en caso de emergencia.
              </Text>
            </View>
          }
        >
          <TextField
            label="Nombre"
            placeholder="Ej. María Pérez"
            value={name}
            onChangeText={setName}
            className="mb-4"
          />
          <TextField
            label="Teléfono"
            placeholder="Ej. +58 414-123-4567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            className="mb-4"
          />
          <TextField
            label="Relación"
            placeholder="Hermana, amigo, pareja..."
            value={relationship}
            onChangeText={setRelationship}
          />
        </Card>

        <View className="flex-row items-center justify-between mt-6">
          {initialContact ? (
            <TouchableOpacity onPress={handleRemove} className="px-3 py-2">
              <Text className="text-sm font-JakartaSemiBold text-red-500">
                Eliminar contacto
              </Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          <View className="flex-row space-x-3">
            <Button
              title="Cancelar"
              variant="ghost"
              onPress={onClose}
              className="px-6"
            />
            <Button
              title={initialContact ? "Guardar cambios" : "Guardar"}
              onPress={handleSave}
              className="px-6"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EmergencyContactModal;
