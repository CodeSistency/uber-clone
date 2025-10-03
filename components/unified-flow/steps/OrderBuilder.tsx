import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";

import { deliveryClient } from "@/app/services/flowClientService";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";

import FlowHeader from "../FlowHeader";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

const mockMenu: CartItem[] = [
  { id: "1", name: "Pizza Margarita", price: 8.5, qty: 0 },
  { id: "2", name: "Pasta Alfredo", price: 9.0, qty: 0 },
  { id: "3", name: "Ensalada Caesar", price: 6.5, qty: 0 },
];

const OrderBuilder: React.FC = () => {
  const { back, goTo, setOrderId } = useMapFlow() as any;
  const { withUI } = useUI();
  const [items, setItems] = React.useState<CartItem[]>(mockMenu);

  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  const increment = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
    );
  };

  const decrement = (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.qty > 0 ? { ...i, qty: i.qty - 1 } : i,
      ),
    );
  };

  return (
    <View className="flex-1">
      <FlowHeader
        title="Armado del pedido"
        subtitle="Selecciona los productos del negocio"
        onBack={back}
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="font-JakartaBold text-gray-800">{item.name}</Text>
            <Text className="font-Jakarta text-gray-600 mb-3">
              $ {item.price.toFixed(2)}
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => decrement(item.id)}
                className="px-4 py-2 bg-gray-200 rounded-lg mr-2"
              >
                <Text className="font-JakartaBold">-</Text>
              </TouchableOpacity>
              <Text className="w-8 text-center font-JakartaMedium">
                {item.qty}
              </Text>
              <TouchableOpacity
                onPress={() => increment(item.id)}
                className="px-4 py-2 bg-primary-500 rounded-lg ml-2"
              >
                <Text className="text-white font-JakartaBold">+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View className="px-5 pb-4">
        <View className="bg-gray-50 rounded-xl p-4 mb-3">
          <Text className="font-JakartaMedium text-gray-700">
            Total: $ {total.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          disabled={total <= 0}
          onPress={async () => {
            const res = await withUI(
              () =>
                deliveryClient.createOrder({
                  storeId: 1,
                  items: items
                    .filter((i) => i.qty > 0)
                    .map((i) => ({ productId: +i.id, quantity: i.qty })),
                  deliveryAddress: "Dir demo",
                  deliveryLatitude: 10.5,
                  deliveryLongitude: -66.9,
                }),
              { loadingMessage: "Creando pedido..." },
            );
            const orderId = res?.data?.orderId || res?.orderId;
            if (orderId) setOrderId(orderId);
            goTo(FLOW_STEPS.CUSTOMER_DELIVERY_CHECKOUT_CONFIRMACION);
          }}
          className={`rounded-xl p-4 ${total > 0 ? "bg-primary-500" : "bg-gray-300"}`}
        >
          <Text className="text-white font-JakartaBold text-center">
            Ir a Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OrderBuilder;
