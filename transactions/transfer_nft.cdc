import BarterYardPackNFT from "../contracts/BarterYardPackNFT.cdc"
import NonFungibleToken from "../contracts/lib/NonFungibleToken.cdc"

transaction(receiverAddress: Address, id: UInt64) {
    let receiver: &{NonFungibleToken.CollectionPublic}
    let collection: &{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}

    prepare(signer: AuthAccount) {           
        self.collection = signer
          .getCapability<&{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(BarterYardPackNFT.CollectionPrivatePath)
          .borrow() ?? panic("Could not borrow collection")

        self.receiver = getAccount(receiverAddress)
          .getCapability(BarterYardPackNFT.CollectionPublicPath)
          .borrow<&{NonFungibleToken.CollectionPublic}>()!
    }

    execute {
        let nft <- self.collection.withdraw(withdrawID: id)
        self.receiver.deposit(token: <- nft)
    }
}
