import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";
import {
  BoxesIcon,
  CogIcon,
  LightbulbIcon,
  NetworkIcon,
  Share2Icon,
} from "lucide-react-native";
import { View } from "react-native";
import { withUniwind } from "uniwind";

const StyledLightbulbIcon = withUniwind(LightbulbIcon);
const StyledNetworkIcon = withUniwind(NetworkIcon);
const StyledBoxesIcon = withUniwind(BoxesIcon);
const StyledCogIcon = withUniwind(CogIcon);
const StyledShare2Icon = withUniwind(Share2Icon);

export default function TabLayout() {
  const [surface, accent] = useThemeColor(["surface", "accent", "overlay"]);

  return (
    <View className="flex-1 bg-background">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: accent,
          tabBarStyle: {
            backgroundColor: surface,
          },
        }}
      >
        <Tabs.Screen
          name="(local-node)"
          options={{
            headerShown: false,
            title: "Local Node",
            tabBarIcon: ({ color }) => <StyledLightbulbIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="(network)"
          options={{
            headerShown: false,
            title: "Network",
            tabBarIcon: ({ color }) => <StyledNetworkIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="(groups)"
          options={{
            headerShown: false,
            title: "Groups",
            tabBarIcon: ({ color }) => <StyledBoxesIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="(proxy)"
          options={{
            headerShown: false,
            title: "Proxy",
            tabBarIcon: ({ color }) => <StyledShare2Icon color={color} />,
          }}
        />
        <Tabs.Screen
          name="(settings)"
          options={{
            headerShown: false,
            title: "Settings",
            tabBarIcon: ({ color }) => <StyledCogIcon color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
