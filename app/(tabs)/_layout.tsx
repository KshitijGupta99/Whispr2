import { AuthGuard } from "@/components/AuthGuard";
import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: "#FFFFFF", borderTopColor: "#ECEEF5" },
          tabBarActiveTintColor: "#4F6EF7",
          tabBarInactiveTintColor: "#8A8FA8",
        }}
      >
        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
            tabBarIcon: () => <Text>✦</Text>,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: () => <Text>♫</Text>,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
