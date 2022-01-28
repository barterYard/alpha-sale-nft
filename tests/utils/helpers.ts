import {
  getServiceAddress,
} from "flow-js-testing";

export async function getAddressMap(to?: any) {
  const account = to ?? (await getServiceAddress());

  return {
    NonFungibleToken: account,
    MetadataViews: account,
    NFTAirDrop: account,
    BarterYardPackNFT: account,
  };
}
