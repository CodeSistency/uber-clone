import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";

import { LocationIllustration } from "@/components/onboarding/illustrations";
import { OnboardingScaffold } from "@/components/onboarding/OnboardingScaffold";
import { SequentialSelector } from "@/components/onboarding/SequentialSelector";
import { Card, SelectOption } from "@/components/ui";
import { fetchAPI } from "@/lib/fetch";
import { useOnboardingStore } from "@/store";

const COUNTRIES = [
  {
    code: "VE",
    name: "Venezuela",
    flag: "🇻🇪",
    states: ["Miranda", "Caracas", "Zulia", "Táchira", "Anzoátegui"],
  },
  {
    code: "CO",
    name: "Colombia",
    flag: "🇨🇴",
    states: [
      "Bogotá D.C.",
      "Antioquia",
      "Valle del Cauca",
      "Cundinamarca",
      "Santander",
    ],
  },
  {
    code: "MX",
    name: "Mexico",
    flag: "🇲🇽",
    states: [
      "Ciudad de México",
      "Jalisco",
      "Nuevo León",
      "Puebla",
      "Guanajuato",
    ],
  },
  {
    code: "AR",
    name: "Argentina",
    flag: "🇦🇷",
    states: ["Buenos Aires", "Córdoba", "Santa Fe", "Mendoza", "Tucumán"],
  },
  {
    code: "PE",
    name: "Peru",
    flag: "🇵🇪",
    states: ["Lima", "Arequipa", "Cusco", "Trujillo", "Piura"],
  },
  {
    code: "CL",
    name: "Chile",
    flag: "🇨🇱",
    states: ["Santiago", "Valparaíso", "Biobío", "Maule", "Los Lagos"],
  },
  {
    code: "EC",
    name: "Ecuador",
    flag: "🇪🇨",
    states: ["Pichincha", "Guayas", "Azuay", "Manabí", "Los Ríos"],
  },
  {
    code: "BO",
    name: "Bolivia",
    flag: "🇧🇴",
    states: ["La Paz", "Santa Cruz", "Cochabamba", "Potosí", "Chuquisaca"],
  },
];

const CITIES: Record<string, string[]> = {
  Miranda: [
    "Caracas",
    "Los Teques",
    "Guarenas",
    "Charallave",
    "San Antonio de los Altos",
  ],
  Caracas: [
    "Caracas",
    "Los Teques",
    "Guarenas",
    "Charallave",
    "San Antonio de los Altos",
  ],
  "Bogotá D.C.": ["Bogotá", "Soacha", "Zipaquirá", "Cajicá", "Chía"],
  Antioquia: ["Medellín", "Bello", "Itagüí", "Envigado", "Sabaneta"],
  "Ciudad de México": [
    "Ciudad de México",
    "Ecatepec",
    "Naucalpan",
    "Tlalnepantla",
    "Chimalhuacán",
  ],
  Jalisco: ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonala", "El Salto"],
  "Buenos Aires": [
    "Buenos Aires",
    "La Plata",
    "Mar del Plata",
    "Bahía Blanca",
    "Tandil",
  ],
  Córdoba: [
    "Córdoba",
    "Villa María",
    "Río Cuarto",
    "San Francisco",
    "Villa Carlos Paz",
  ],
  Lima: ["Lima", "Callao", "Ate", "Comas", "San Juan de Lurigancho"],
  Arequipa: ["Arequipa", "Cayma", "Yanahuara", "Socabaya", "Tiabaya"],
  Santiago: ["Santiago", "Puente Alto", "Maipú", "La Florida", "Peñalolén"],
  Valparaíso: [
    "Valparaíso",
    "Viña del Mar",
    "Quilpué",
    "Villa Alemana",
    "Concón",
  ],
  Pichincha: ["Quito", "Sangolquí", "Cumbayá", "Píntag", "Tumbaco"],
  Guayas: ["Guayaquil", "Durán", "Milagro", "Daule", "Samborondón"],
  "La Paz": ["La Paz", "El Alto", "Viacha", "Achocalla", "Laja"],
  "Santa Cruz": [
    "Santa Cruz de la Sierra",
    "Warnes",
    "Cotoca",
    "Montero",
    "La Guardia",
  ],
};

const getCountryOptions = (): SelectOption[] =>
  COUNTRIES.map((country) => ({
    label: `${country.flag} ${country.name}`,
    value: country.code,
    subtitle: "",
  }));

const getStateOptions = (countryCode: string): SelectOption[] => {
  const country = COUNTRIES.find((c) => c.code === countryCode);
  if (!country) return [];
  return country.states.map((state) => ({ label: state, value: state }));
};

const getCityOptions = (state: string): SelectOption[] => {
  const cities = CITIES[state] || [];
  return cities.map((city) => ({ label: city, value: city }));
};

const getCountryName = (countryCode: string): string =>
  COUNTRIES.find((country) => country.code === countryCode)?.name || "";

export default function CountrySelection() {
  const { currentStep, isLoading, setLoading, setError, updateUserData } =
    useOnboardingStore();

  const [country, setCountry] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [city, setCity] = useState<string>("");

  useEffect(() => {
    const { userData } = useOnboardingStore.getState();
    if (userData.country) {
      setCountry(userData.country);
      setState(userData.state || "");
      setCity(userData.city || "");
    }
  }, []);

  useEffect(() => {
    if (Number.isFinite(currentStep) && currentStep !== 0) {
      router.replace("/");
    }
  }, [currentStep]);

  const selectors = useMemo(() => {
    const countryOptions = getCountryOptions();
    const stateOptions = country ? getStateOptions(country) : [];
    const cityOptions = state ? getCityOptions(state) : [];

    return [
      {
        id: "country",
        placeholder: "Selecciona tu país",
        options: countryOptions,
        value: country,
        onChange: (value: string) => {
          setCountry(value);
          setState("");
          setCity("");
        },
      },
      {
        id: "state",
        placeholder: stateOptions.length
          ? "Selecciona tu estado / provincia"
          : "Selecciona tu país primero",
        options: stateOptions,
        value: state,
        onChange: (value: string) => {
          setState(value);
          setCity("");
        },
      },
      {
        id: "city",
        placeholder: cityOptions.length
          ? "Selecciona tu ciudad"
          : "Selecciona tu estado primero",
        options: cityOptions,
        value: city,
        onChange: (value: string) => setCity(value),
      },
    ];
  }, [city, country, state]);

  const handleContinue = async () => {
    if (!country || !city) {
      Alert.alert("Algo falta", "Selecciona país y ciudad para continuar");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      updateUserData({
        country,
        state,
        city,
      });

      await fetchAPI("onboarding/location", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          country,
          state,
          city,
        }),
      });

      const { completeStep } = useOnboardingStore.getState();
      completeStep("location", { country, state, city });
      router.replace("./travel-preferences");
    } catch (error: any) {
      setError(error.message || "No pudimos guardar tu ubicación");
      Alert.alert("Error", error.message || "No pudimos guardar tu ubicación");
    } finally {
      setLoading(false);
    }
  };

  if (currentStep !== 0) {
    return null;
  }

  return (
    <OnboardingScaffold
      illustration={LocationIllustration}
      title="¿Dónde te encuentras?"
      subtitle="Personalizamos la experiencia según tu ubicación"
      onContinue={handleContinue}
      onSkip={() => router.replace("./travel-preferences")}
      continueButtonText="Continuar"
      isContinueDisabled={!country || !city}
      isLoading={isLoading}
    >
      <SequentialSelector steps={selectors} />
    </OnboardingScaffold>
  );
}
