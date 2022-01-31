import BarterYardPackNFT from "../../contracts/BarterYardPackNFT.cdc"
import NFTAirDrop from "../../contracts/lib/NFTAirDrop.cdc"
import NonFungibleToken from "../../contracts/lib/NonFungibleToken.cdc"

transaction(dropAddress: Address, id: UInt64, signature: String) {

    let receiver: &{NonFungibleToken.CollectionPublic}
    let drop: &{NFTAirDrop.DropPublic}

    prepare(signer: AuthAccount) {
        if signer.borrow<&BarterYardPackNFT.Collection>(from: BarterYardPackNFT.CollectionStoragePath) == nil {
            // create a new empty collection
            let collection <- BarterYardPackNFT.createEmptyCollection()
            
            // save it to the account
            signer.save(<-collection, to: BarterYardPackNFT.CollectionStoragePath)

            // create a public capability for the collection
            signer.link<&BarterYardPackNFT.Collection{NonFungibleToken.CollectionPublic, BarterYardPackNFT.BarterYardPackNFTCollectionPublic}>(
                BarterYardPackNFT.CollectionPublicPath, 
                target: BarterYardPackNFT.CollectionStoragePath
            )
        }
           
        self.receiver = signer
            .getCapability(BarterYardPackNFT.CollectionPublicPath)!
            .borrow<&{NonFungibleToken.CollectionPublic}>()!

        self.drop = getAccount(dropAddress)
            .getCapability(NFTAirDrop.DropPublicPath)!
            .borrow<&{NFTAirDrop.DropPublic}>()!
    }

    execute {
        self.drop.claim(
            id: id, 
            signature: signature.decodeHex(), 
            receiver: self.receiver,
        )
    }
}
