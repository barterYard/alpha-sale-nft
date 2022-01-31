import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import BarterYardPackNFT from "../../contracts/BarterYardPackNFT.cdc"
import NFTAirDrop from "../../contracts/lib/NFTAirDrop.cdc"

transaction(packPartId: Int, description: String, thumbnail: String, publicKey: String) {
    
    let admin: &BarterYardPackNFT.Admin
    let drop: &NFTAirDrop.Drop

    prepare(signer: AuthAccount) {
        self.admin = signer
            .borrow<&BarterYardPackNFT.Admin>(from: BarterYardPackNFT.AdminStoragePath)
            ?? panic("Could not borrow a reference to the NFT admin")
        
        if let existingDrop = signer.borrow<&NFTAirDrop.Drop>(from: NFTAirDrop.DropStoragePath) {
            self.drop = existingDrop
        } else {
            let collection = signer.getCapability<&{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(BarterYardPackNFT.CollectionPrivatePath)

            let drop <- NFTAirDrop.createDrop(
                nftType: Type<@BarterYardPackNFT.NFT>(),
                collection: collection
            )

            self.drop = &drop as &NFTAirDrop.Drop

            signer.save(<- drop, to: NFTAirDrop.DropStoragePath)

            signer.link<&NFTAirDrop.Drop{NFTAirDrop.DropPublic}>(
                NFTAirDrop.DropPublicPath, 
                target: NFTAirDrop.DropStoragePath
            )
        }
    }

    execute {
        let token <- self.admin.mintNFT(
            packPartId: packPartId,
            description: description,
            thumbnail: thumbnail
        )

        self.drop.deposit(token: <- token, publicKey: publicKey.decodeHex())
    }
}
