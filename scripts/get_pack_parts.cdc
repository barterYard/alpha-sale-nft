import BarterYardPackNFT from "../contracts/BarterYardPackNFT.cdc"

pub fun main(id: Int): BarterYardPackNFT.PackPart {
    return BarterYardPackNFT.getPackPartById(packPartId: id)!
}
