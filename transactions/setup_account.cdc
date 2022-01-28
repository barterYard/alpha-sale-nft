import NonFungibleToken from "../contracts/NonFungibleToken.cdc"
import BarterYardPackNFT from "../contracts/BarterYardPackNFT.cdc"

// This transaction configures an account to hold BarterYardPackNFT Items.

transaction {
    prepare(signer: AuthAccount) {
        // if the account doesn't already have a collection
        if signer.borrow<&BarterYardPackNFT.Collection>(from: BarterYardPackNFT.CollectionStoragePath) == nil {

            // create a new empty collection
            let collection <- BarterYardPackNFT.createEmptyCollection()
            
            // save it to the account
            signer.save(<-collection, to: BarterYardPackNFT.CollectionStoragePath)

            // create a public capability for the collection
            signer.link<&BarterYardPackNFT.Collection{NonFungibleToken.CollectionPublic, BarterYardPackNFT.BarterYardPackNFTCollectionPublic}>
                (BarterYardPackNFT.CollectionPublicPath, target: BarterYardPackNFT.CollectionStoragePath)
        }
    }
}
