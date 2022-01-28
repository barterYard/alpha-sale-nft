import BarterYardPackNFT from "../contracts/BarterYardPackNFT.cdc"

pub fun main(address: Address): Bool {
    let collection = getAccount(address).getCapability(BarterYardPackNFT.CollectionPublicPath)
        .borrow<&{ BarterYardPackNFT.BarterYardPackNFTCollectionPublic }>()
        ?? panic("Could not borrow a reference to the collection")
    return true
}
