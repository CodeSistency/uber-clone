import { Stack } from "expo-router";
import React from "react";

import MapFlowWrapper from "@/components/mapflow/MapFlowWrapper";
import ChooseDriver from "@/components/mapflow/steps/ChooseDriver";
import ChooseService from "@/components/mapflow/steps/ChooseService";
import ConfirmOrigin from "@/components/mapflow/steps/ConfirmOrigin";
import SetLocations from "@/components/mapflow/steps/SetLocations";
import Summary from "@/components/mapflow/steps/Summary";
import TravelStart from "@/components/mapflow/steps/TravelStart";

const renderStep = (step: string) => {
  switch (step) {
    case "travel_start":
      return <TravelStart />;
    case "set_locations":
      return <SetLocations />;
    case "confirm_origin":
      return <ConfirmOrigin />;
    case "choose_service":
      return <ChooseService />;
    case "choose_driver":
      return <ChooseDriver />;
    case "summary":
      return <Summary />;
    default:
      return <TravelStart />;
  }
};

export default function MapFlowsDemo() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Map Flows Demo" }} />

      {/* Integración Real del MapFlow */}
      <MapFlowWrapper role="customer" renderStep={renderStep} />
    </>
  );
}
