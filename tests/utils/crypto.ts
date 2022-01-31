import * as fcl from "@onflow/fcl";
import {
  ECPrivateKey,
  signatureAlgorithms,
  ECSigner,
  hashAlgorithms
} from "../lib/crypto";
import BN from "bn.js";

const rightPaddedHexBuffer = (value, pad) =>
  Buffer.from(value.padEnd(pad * 2, 0), "hex")

const USER_DOMAIN_TAG = rightPaddedHexBuffer(
  Buffer.from("FLOW-V0.0-user").toString("hex"), 
  32
)

export function makeClaimMessage(address, id) {
  const idBn = new BN(id);
  const idBuffer = idBn.toArrayLike(Buffer, "be", 8)
  const addressBuffer = Buffer.from(fcl.sansPrefix(address), "hex")

  return Buffer.concat([USER_DOMAIN_TAG, addressBuffer, idBuffer])
}

export function generateKeyPair() {
  const privateKey = ECPrivateKey.generate(signatureAlgorithms.ECDSA_P256);
  const publicKey = privateKey.getPublicKey();

  return {
    privateKey: privateKey.toHex(),
    publicKey: publicKey.toHex()
  };
}

export function formatClaimKey(nftId, privateKey) {
  return `${privateKey}${nftId}`;
}

export function generateNFTClaim(address, nftId, privateKeyHex) {
  const privateKey = ECPrivateKey.fromHex(privateKeyHex, signatureAlgorithms.ECDSA_P256)

  const signer = new ECSigner(privateKey, hashAlgorithms.SHA3_256)

  const message = makeClaimMessage(address, nftId)

  const signature = signer.sign(message)

  return signature.toHex()
}
