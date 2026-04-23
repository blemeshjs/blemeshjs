import { Button } from "heroui-native";
import { MoonStarIcon, SunIcon } from "lucide-react-native";
import { useAppTheme } from "./app-theme-context";

export function ThemeToggle() {
  const { toggleTheme, isLight } = useAppTheme();

  const Icon = isLight ? MoonStarIcon : SunIcon;

  return (
    <Button
      onPress={toggleTheme}
      isIconOnly
      size="sm"
      variant="ghost"
      className="rounded-full"
    >
      <Icon size={20} />
    </Button>
  );
}
