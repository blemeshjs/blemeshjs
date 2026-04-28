import { AppText } from "@/components/app-text";
import { useMesh } from "@/components/mesh-provider";
import { MySafeAreaScrollView } from "@/components/my-safe-area-scroll-view";
import { RNNode } from "@blemeshjs/sdk-react-native";
import { CompanyIdentifier } from "@blemeshjs/utils";
import { useRouter } from "expo-router";
import { ListGroup } from "heroui-native/list-group";
import { Separator } from "heroui-native/separator";
import { ChevronRightIcon, NetworkIcon } from "lucide-react-native";
import { observer } from "mobx-react-lite";
import React, { Fragment, useCallback } from "react";
import { withUniwind } from "uniwind";

const StyledChevronRightIcon = withUniwind(ChevronRightIcon);
const StyledNetworkIcon = withUniwind(NetworkIcon);

export default observer(function NetworkScreen() {
  // properties
  const mesh = useMesh();
  const router = useRouter();
  const provisionerNode = mesh.allNodes.provisionerNode;
  const configuredNodes = mesh.allNodes.configuredNodes;
  const otherNodes = mesh.allNodes.notConfiguredNodes;

  const goToNode = useCallback(
    (node: RNNode) => {
      const push = router.push;
      push(`/(tabs)/(network)/configuration/${node.uuid.uuidString}/node`);
    },
    [router.push],
  );

  return (
    <MySafeAreaScrollView>
      <AppText className="text-muted font-bold mx-2 mt-6 p-2 text-md">
        This Provisionser
      </AppText>
      {provisionerNode && (
        <ListGroup variant="secondary" className="mx-2">
          <ListGroup.Item onPress={() => goToNode(provisionerNode)}>
            <ListGroup.ItemPrefix>
              <StyledNetworkIcon size={30} className="text-muted" />
            </ListGroup.ItemPrefix>
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle>{provisionerNode.name}</ListGroup.ItemTitle>
              <ListGroup.ItemDescription className="text-muted">
                Company:{" "}
                {CompanyIdentifier.nameForId(provisionerNode.companyIdentifier)}
              </ListGroup.ItemDescription>
              <ListGroup.ItemDescription className="text-muted">
                Address: 0x{provisionerNode.primaryUnicastAddress.hex} (
                {provisionerNode.elementsCount})
              </ListGroup.ItemDescription>
            </ListGroup.ItemContent>
            <ListGroup.ItemSuffix>
              <StyledChevronRightIcon className="text-muted" />
            </ListGroup.ItemSuffix>
          </ListGroup.Item>
        </ListGroup>
      )}
      {!!configuredNodes?.length && (
        <>
          <AppText className="text-muted font-bold mx-2 mt-6 p-2 text-md">
            Configured Nodes
          </AppText>
          <ListGroup variant="secondary" className="mx-2">
            {configuredNodes!.map((node, index) => (
              <>
                <ListGroup.Item key={node.uuid.uuidString}>
                  <ListGroup.ItemPrefix>
                    <StyledNetworkIcon size={30} className="text-muted" />
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle>{node.name}</ListGroup.ItemTitle>
                    <ListGroup.ItemDescription className="text-muted">
                      Company:{" "}
                      {CompanyIdentifier.nameForId(node.companyIdentifier)}
                    </ListGroup.ItemDescription>
                    <ListGroup.ItemDescription className="text-muted">
                      Address: 0x{node.primaryUnicastAddress.hex} (
                      {node.elementsCount})
                    </ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix>
                    <StyledChevronRightIcon className="text-muted" />
                  </ListGroup.ItemSuffix>
                </ListGroup.Item>
                {index !== configuredNodes!.length - 1 && (
                  <Separator className="mx-2" />
                )}
              </>
            ))}
          </ListGroup>
        </>
      )}
      {!!otherNodes?.length && (
        <>
          <AppText className="text-muted font-bold mx-2 mt-6 p-2 text-md">
            Other Nodes
          </AppText>
          <ListGroup variant="secondary" className="mx-2">
            {otherNodes!.map((node, index) => (
              <Fragment key={node.uuid.uuidString}>
                <ListGroup.Item
                  onPress={() => goToNode(node)}
                  key={node.uuid.uuidString}
                >
                  <ListGroup.ItemPrefix>
                    <StyledNetworkIcon size={30} className="text-muted" />
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle>{node.name}</ListGroup.ItemTitle>
                    <ListGroup.ItemDescription className="text-muted">
                      Company:{" "}
                      {CompanyIdentifier.nameForId(node.companyIdentifier)}
                    </ListGroup.ItemDescription>
                    <ListGroup.ItemDescription className="text-muted">
                      Address: 0x{node.primaryUnicastAddress.hex} (
                      {node.elementsCount})
                    </ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix>
                    <StyledChevronRightIcon className="text-muted" />
                  </ListGroup.ItemSuffix>
                </ListGroup.Item>
                {index !== otherNodes!.length - 1 && (
                  <Separator className="mx-2" />
                )}
              </Fragment>
            ))}
          </ListGroup>
        </>
      )}
    </MySafeAreaScrollView>
  );
});
