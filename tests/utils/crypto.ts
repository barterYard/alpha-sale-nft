import { ECPrivateKey, signatureAlgorithms } from "../lib/crypto";

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
