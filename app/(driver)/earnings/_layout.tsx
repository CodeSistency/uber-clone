import { Stack } from "expo-router";

export default function EarningsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Earnings Dashboard",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="trips"
        options={{
          title: "Trip History",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="payments"
        options={{
          title: "Payment Methods",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="instant-pay"
        options={{
          title: "Instant Pay",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="promotions"
        options={{
          title: "Promotions",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="challenges"
        options={{
          title: "Challenges",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
