import { cn } from "heroui-native";
import { ScrollView, ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { type AnimatedProps } from "react-native-reanimated";
import { PropsWithChildren } from "react";
import { useHeaderHeight } from "@react-navigation/elements";

const AnimatedView = Animated.createAnimatedComponent(ScrollView);

interface Props extends AnimatedProps<ScrollViewProps> {
  className?: string;
  contentContainerClassName?: string;
}

export const MySafeAreaScrollView: React.FC<PropsWithChildren<Props>> = ({
  children,
  className,
  ...rest
}) => {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  return (
    <AnimatedView
      className={cn("bg-surface flex flex-1", className)}
      style={{
        paddingTop: headerHeight,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
      {...rest}
    >
      {children}
    </AnimatedView>
  );
};
