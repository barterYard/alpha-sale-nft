import {
  deployContractByName,
  getServiceAddress,
  mintFlow,
} from "flow-js-testing";
import { getAddressMap } from "./helpers";

export async function deployContracts() {
  const to = await getServiceAddress();
  const addressMap = await getAddressMap(to);

  await mintFlow(to, "1000");

  await deployContractByName({
    to,
    name: "NonFungibleToken",
    addressMap,
  });

  await deployContractByName({
    to,
    name: "MetadataViews",
    addressMap,
  });

  await deployContractByName({
    to,
    name: "NFTAirDrop",
    addressMap,
  });

  return deployContractByName({
    to,
    name: "BarterYardPackNFT",
    addressMap,
  });
}