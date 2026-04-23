import { useMesh } from "@/components/mesh-provider";
import { MySafeAreaScrollView } from "@/components/my-safe-area-scroll-view";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { ChevronRightIcon } from "lucide-react-native";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { withUniwind } from "uniwind";
import { useImmer } from "use-immer";
import { Alert, AlertDialog } from "@/components/my-alert";

const StyledChevronRightIcon = withUniwind(ChevronRightIcon);

export default observer(function NodeAddNetworkKeyScreen() {
  // properties
  const mesh = useMesh();
  const local = useLocalSearchParams<{ node: string }>();
  const navigation = useNavigation();
  const node = useMemo(() => {
    const getNode = mesh.getNode;
    return getNode(local.node);
  }, [local.node, mesh.getNode]);

  // state
  const [alert, setAlert] = useImmer<null | Alert>(null);

  return (
    <MySafeAreaScrollView contentContainerClassName="gap-4">
      {alert && (
        <AlertDialog open alert={alert} onClose={() => setAlert(null)} />
      )}
    </MySafeAreaScrollView>
  );
});
