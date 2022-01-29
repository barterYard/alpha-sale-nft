import BarterYardPackNFT from "../../contracts/BarterYardPackNFT.cdc"

transaction(packName: String, packSupply: UInt16) {
    
    let admin: &BarterYardPackNFT.Admin

    prepare(signer: AuthAccount) {
        self.admin = signer
            .borrow<&BarterYardPackNFT.Admin>(from: BarterYardPackNFT.AdminStoragePath)
            ?? panic("Could not borrow a reference to the NFT admin")
    }

    execute {
        self.admin.newPackMembers(
            packName: packName,
            packSupply: packSupply
        )
    }
}
