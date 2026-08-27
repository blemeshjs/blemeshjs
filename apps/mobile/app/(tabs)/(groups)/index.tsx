import { MySafeAreaView } from "@/components/my-safe-area-view";
import { Avatar, Card, useThemeColor } from "heroui-native";
import { BoxesIcon, ChevronRightIcon } from "lucide-react-native";
import { Text, View } from "react-native";

export default function GroupsScreen() {
  const mutedColor = useThemeColor("muted");
  return (
    <MySafeAreaView>
      <Card className="rounded-none">
        <Card.Body className="flex-row items-center gap-4 py-3">
          <Avatar alt="Groups">
            <Avatar.Fallback>
              <BoxesIcon size={24} color={mutedColor} />
            </Avatar.Fallback>
          </Avatar>
          <View className="flex-1 justify-center">
            <Text className="text-foreground">Room</Text>
            <Text style={{ color: mutedColor, fontSize: 14 }}>Address: 0xC000</Text>
          </View>
          <ChevronRightIcon size={20} color={mutedColor} />
        </Card.Body>
      </Card>
    </MySafeAreaView>
  );
}
