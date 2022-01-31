import {
  deployContract,
  deployContractByName,
  getContractCode,
  getServiceAddress,
  mintFlow,
} from "flow-js-testing";
import { getAddressMap } from "./helpers";

export async function deployContracts() {
  const to = await getServiceAddress();
  const addressMap = await getAddressMap(to);

  await mintFlow(to, "1000");

  await deployContract({
    to,
    name: "NonFungibleToken",
    code: await getContractCode({ name: "lib/NonFungibleToken", addressMap }),
    addressMap,
  });
  
  await deployContract({
    to,
    name: "MetadataViews",
    code: await getContractCode({ name: "lib/MetadataViews", addressMap }),
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