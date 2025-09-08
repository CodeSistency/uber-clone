import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUI } from "@/components/UIWrapper";
import {
  Button,
  Card,
  Badge,
  TextField,
  Switch as UISwitch,
  Tabs,
  BottomSheet,
  TextArea,
  Checkbox,
  RadioGroup,
  Select,
  Stepper,
  Glass,
} from "@/components/ui";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="mb-6">
    <Text className="mb-2 text-lg font-JakartaBold text-black dark:text-white">{title}</Text>
    <Card variant="elevated">{children}</Card>
  </View>
);

export default function ComponentesScreen() {
  const { theme } = useUI();

  const [tab, setTab] = useState("one");
  const [switchOn, setSwitchOn] = useState(false);
  const [checked, setChecked] = useState(false);
  const [radio, setRadio] = useState<string | null>("a");
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [text, setText] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-brand-primary dark:bg-brand-primaryDark">
      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 24 }}>
        <Text className="text-2xl font-JakartaExtraBold text-black dark:text-white mb-4">Componentes UI</Text>

        <Section title="Buttons">
          <View className="flex-row flex-wrap gap-3">
            <Button title="Primary" />
            <Button title="Secondary" variant="secondary" />
            <Button title="Outline" variant="outline" />
            <Button title="Ghost" variant="ghost" />
            <Button title="Danger" variant="danger" />
            <Button title="Success" variant="success" />
            <Button title="Loading" loading />
          </View>
        </Section>

        <Section title="Badges">
          <View className="flex-row flex-wrap gap-2">
            <Badge label="Default" />
            <Badge label="Success" variant="success" />
            <Badge label="Warning" variant="warning" />
            <Badge label="Danger" variant="danger" />
            <Badge label="Info" variant="info" />
          </View>
        </Section>

        <Section title="Cards & Glass">
          <View className="gap-3">
            <Card title="Card Elevated" subtitle="Tarjeta con sombra">
              <Text className="text-black dark:text-white">Contenido de ejemplo</Text>
            </Card>
            <Card title="Card Outline" variant="outline">
              <Text className="text-black dark:text-white">Borde tenue</Text>
            </Card>
            <Glass className="p-4">
              <Text className="text-black dark:text-white">Glass container</Text>
            </Glass>
          </View>
        </Section>

        <Section title="Inputs">
          <View className="gap-3">
            <TextField label="Nombre" placeholder="Tu nombre" value={text} onChangeText={setText} />
            <TextArea label="Descripción" placeholder="Escribe algo..." />
          </View>
        </Section>

        <Section title="Switch, Checkbox, Radio">
          <View className="gap-3">
            <UISwitch checked={switchOn} onChange={setSwitchOn} />
            <Checkbox label="Acepto términos" checked={checked} onChange={setChecked} />
            <RadioGroup
              value={radio}
              onChange={setRadio}
              options={[
                { value: "a", label: "Opción A" },
                { value: "b", label: "Opción B" },
              ]}
            />
          </View>
        </Section>

        <Section title="Select & Stepper">
          <View className="gap-3">
            <Select
              value={selected}
              onChange={setSelected}
              placeholder="Selecciona una opción"
              options={[
                { label: "Uno", value: "1" },
                { label: "Dos", value: "2" },
                { label: "Tres", value: "3" },
              ]}
            />
            <Stepper value={step} min={0} max={10} onChange={setStep} />
          </View>
        </Section>

        <Section title="Tabs">
          <Tabs
            items={[
              { key: "one", label: "Uno" },
              { key: "two", label: "Dos" },
              { key: "three", label: "Tres" },
            ]}
            value={tab}
            onChange={setTab}
            variant="pill"
          />
        </Section>

        <Section title="BottomSheet">
          <View className="flex-row items-center gap-3">
            <Button title={sheetOpen ? "Cerrar" : "Abrir"} onPress={() => setSheetOpen((s) => !s)} />
            <Text className="text-black dark:text-white">Hoja inferior simple</Text>
          </View>
        </Section>
      </ScrollView>

      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <Text className="text-black dark:text-white font-JakartaBold mb-2">Hola!</Text>
        <Text className="text-black dark:text-white">Este es un BottomSheet básico.</Text>
        <View className="mt-3">
          <Button title="Cerrar" onPress={() => setSheetOpen(false)} />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}



