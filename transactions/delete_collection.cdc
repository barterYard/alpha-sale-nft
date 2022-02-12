import NonFungibleToken from "../contracts/lib/NonFungibleToken.cdc"
import BarterYardPackNFT from "../contracts/BarterYardPackNFT.cdc"

transaction {
    prepare(signer: AuthAccount) {
        let collection <- signer.load<@BarterYardPackNFT.Collection>(from: BarterYardPackNFT.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the NFT collection")
        destroy collection
    }
}
