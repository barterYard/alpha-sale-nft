import BarterYardPackNFT from "../contracts/BarterYardPackNFT.cdc"
import MetadataViews from "../contracts/lib/MetadataViews.cdc"

pub struct AccountItem {
    pub let tokenId: UInt64
    pub let name: String
    pub let description: String
    pub let thumbnail: String
    pub let owner: Address

    init(tokenId: UInt64, name: String, description: String, thumbnail: String, owner: Address) {
        self.tokenId = tokenId
        self.name = name
        self.description = description
        self.thumbnail = thumbnail
        self.owner = owner
    }
}

pub fun main(address: Address, id: UInt64): AccountItem? {
    let collection = getAccount(address).getCapability(BarterYardPackNFT.CollectionPublicPath)
        .borrow<&{ BarterYardPackNFT.BarterYardPackNFTCollectionPublic }>()
        ?? panic("Could not borrow a reference to the collection")

    if let nft = collection.borrowBarterYardPackNFT(id: id) {
        // Get the basic display information for this NFT
        if let view = nft.resolveView(Type<MetadataViews.Display>()) {
            let display = view as! MetadataViews.Display

            return AccountItem(
                tokenId: id,
                name: display.name,
                description: display.description,
                thumbnail: display.thumbnail.uri(),
                owner: address
            )
        }
    }
    return nil
}
