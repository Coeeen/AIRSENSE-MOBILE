import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";

const RootLayout = () => {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#71A78F",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#333" : "#8ECA96",
          height: 65,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map" 
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="map" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="locations"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="map-marker" size={24} color={color} testID="goToLocations"/>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          // headerShown: true,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="cog" size={24} color={color} testID="goToSettings" />
          ),
        }}
      />
    </Tabs>
  );
};

export default RootLayout;
