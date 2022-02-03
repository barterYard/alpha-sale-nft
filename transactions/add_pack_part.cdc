import BarterYardPackNFT from "../contracts/BarterYardPackNFT.cdc"

transaction(name: String, description: String, ipfsThumbnailCid: String, maxSupply: UInt16) {
    
    let admin: &BarterYardPackNFT.Admin

    prepare(signer: AuthAccount) {
        self.admin = signer
            .borrow<&BarterYardPackNFT.Admin>(from: BarterYardPackNFT.AdminStoragePath)
            ?? panic("Could not borrow a reference to the NFT admin")
    }

    execute {
        self.admin.createNewPack(
            name: name,
            description: description,
            ipfsThumbnailCid: ipfsThumbnailCid,
            ipfsThumbnailPath: nil,
            maxSupply: maxSupply
        )
    }
}
