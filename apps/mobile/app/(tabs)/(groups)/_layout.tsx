import { Stack } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { PlusIcon } from "lucide-react-native";
import { View } from "react-native";

function HeaderRight() {
  const foreground = useThemeColor("foreground");
  return (
    <View className="flex flex-row gap-2">
      <Button variant="outline" className="rounded-full">
        Edit
      </Button>
      <Button isIconOnly size="md" variant="outline" className="rounded-full">
        <PlusIcon size={20} color={foreground} />
      </Button>
    </View>
  );
}

export default function GroupsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Groups",
          headerTransparent: true,
          headerRight: () => <HeaderRight />,
        }}
      />
    </Stack>
  );
}
