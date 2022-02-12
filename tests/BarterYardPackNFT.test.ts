import path from "path";
import {
  emulator,
  executeScript,
  getAccountAddress,
  init,
  sendTransaction,
} from "flow-js-testing";
import { deployContracts } from "./utils/deployContracts";
import { getAddressMap } from "./utils/helpers";
import { generateKeyPair, generateNFTClaim } from "./utils/crypto";

// Increase timeout if your tests failing due to timeout
jest.setTimeout(50000);

describe("BarterYardPackNFT", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../");
    const port = 8080;
    const logging = false;

    await init(basePath, { port });
    return emulator.start(port, logging);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  test("should deploy the contracts", async () => {
    const [{ events }] = await deployContracts();

    const initEvent = events.find((e) =>
      (e.type as string).endsWith("BarterYardPackNFT.ContractInitialized")
    );

    expect(initEvent).toBeDefined();
  });

  test("should setup account", async () => {
    await deployContracts();
    const addressMap = await getAddressMap()
 
    /* Setup account tx */
    const signers = [addressMap.BarterYardPackNFT];
    const [_tx, txError] = await sendTransaction({ name: 'setup_account', signers, addressMap });
    expect(txError).toBeNull()

    /* Check account script */
    const args = [addressMap.BarterYardPackNFT];
    const [result, scriptError] = await executeScript({ name: 'check_account', args });
    expect(result).toBeTruthy()
    expect(scriptError).toBeNull()
  });

  test('should allow admin to mint NFT', async () => {
    await deployContracts();
    const addressMap = await getAddressMap()
    const signers = [addressMap.BarterYardPackNFT];

    // Create Pack Part
    let args = [
      "Alpha",
      "This alpha pass grant you a place in the first 1000 members of the pack",
      "ipfsCID",
      1000
    ];
    let [_tx, txError] = await sendTransaction({ name: 'add_pack_part', signers, args, addressMap });

    expect(txError).toBeNull()

    // Create NFT
    const keys = generateKeyPair();
    args = [0, keys.publicKey];
    const [{ events }, mintError] = await sendTransaction({ name: 'airdrop/airdrop_mint', signers, args, addressMap });

    const mintEvent = events.find((e) =>
      (e.type as string).endsWith("BarterYardPackNFT.Mint")
    );

    expect(mintError).toBeNull()
    expect(mintEvent).toBeDefined();
  })

  test('should not create NFT if pack part was not created', async () => {
    await deployContracts();
    const addressMap = await getAddressMap()
    const signers = [addressMap.BarterYardPackNFT];

    // Create NFT
    const keys = generateKeyPair();
    const args = [0, keys.publicKey];
    const [_tx, txError] = await sendTransaction({ name: 'airdrop/airdrop_mint', signers, args, addressMap });

    expect(txError).toContain('can\'t mint nft because invalid packPartId was providen')
  })

  test('should be able to claim NFT with token', async () => {
    await deployContracts();
    const Alice = await getAccountAddress("Alice");
    const addressMap = await getAddressMap()
    const dropAddress = addressMap.BarterYardPackNFT

    const name = "Alpha"
    const description = "This alpha pass grant you a place in the first 1000 members of the pack"
    const ipfsCID = "ipfsCID"

    // Create Pack Part
    await sendTransaction({
      name: 'add_pack_part',
      signers: [dropAddress],
      args: [
        name,
        description,
        ipfsCID,
        1000
      ],
      addressMap
    });

    // Create NFT
    const keys = generateKeyPair();
    await sendTransaction({
      name: 'airdrop/airdrop_mint',
      signers: [dropAddress],
      args: [0, keys.publicKey],
      addressMap
    });

    // Setup user account
    await sendTransaction({
      name: 'setup_account',
      signers: [Alice],
      addressMap
    });

    const signature = generateNFTClaim(Alice, 0, keys.privateKey)

    // Redeem NFT
    const [,txError] = await sendTransaction({
      name: 'airdrop/claim_nft',
      signers: [Alice],
      args: [
        dropAddress,
        0,
        signature,
      ],
      addressMap
    });
    expect(txError).toBeNull()

    // Account should have NFT
    const [result, scriptError] = await executeScript({ name: 'get_nft', args: [Alice, 0] });
    expect(result).toEqual({
      tokenId: 0,
      name,
      description,
      thumbnail: `ipfs://${ipfsCID}`,
      owner: Alice,
    })
    expect(scriptError).toBeNull()
  })

  test('should not be able to claim NFT with another token', async () => {
    await deployContracts();
    const Alice = await getAccountAddress("Alice");
    const addressMap = await getAddressMap()
    const dropAddress = addressMap.BarterYardPackNFT

    const name = "Alpha"
    const description = "This alpha pass grant you a place in the first 1000 members of the pack"
    const ipfsCID = "ipfsCID"

    // Create Pack Part
    await sendTransaction({
      name: 'add_pack_part',
      signers: [dropAddress],
      args: [
        name,
        description,
        ipfsCID,
        1000
      ],
      addressMap
    });

    // Create NFT
    const keys = generateKeyPair();
    const otherKeys = generateKeyPair();

    await sendTransaction({
      name: 'airdrop/airdrop_mint',
      signers: [dropAddress],
      args: [0, keys.publicKey],
      addressMap
    });

    // Setup user account
    await sendTransaction({
      name: 'setup_account',
      signers: [Alice],
      addressMap
    });

    const signature = generateNFTClaim(Alice, 0, otherKeys.privateKey)

    // Redeem NFT
    const [,txError] = await sendTransaction({
      name: 'airdrop/claim_nft',
      signers: [Alice],
      args: [
        dropAddress,
        0,
        signature,
      ],
      addressMap
    });
    expect(txError).not.toBeNull()
  })

  test('should not be able to mint more than max supply', async () => {
    await deployContracts();
    const addressMap = await getAddressMap()
    const dropAddress = addressMap.BarterYardPackNFT

    // Create Pack Part
    await sendTransaction({
      name: 'add_pack_part',
      signers: [dropAddress],
      args: [
        "Alpha",
        "This alpha pass grant you a place in the first 1000 members of the pack",
        "ipfsCID",
        1
      ],
      addressMap
    });

    const keys = generateKeyPair();
    
    // Create NFT
    await sendTransaction({
      name: 'airdrop/airdrop_mint',
      signers: [dropAddress],
      args: [0, keys.publicKey],
      addressMap
    });

    // Try to create a second NFT
    const [_tx, txError] = await sendTransaction({
      name: 'airdrop/airdrop_mint',
      signers: [dropAddress],
      args: [0, keys.publicKey],
      addressMap
    });

    expect(txError).not.toBeNull()
    expect(txError).toContain("[SupplyManager](increment): can't increment totalSupply as maxSupply has been reached")
  })

  test('should emit burn event if NFT is destoyed', async () => {
    await deployContracts();
    const Alice = await getAccountAddress("Alice");
    const addressMap = await getAddressMap()
    const dropAddress = addressMap.BarterYardPackNFT

    const name = "Alpha"
    const description = "This alpha pass grant you a place in the first 1000 members of the pack"
    const ipfsCID = "ipfsCID"

    // Create Pack Part
    await sendTransaction({
      name: 'add_pack_part',
      signers: [dropAddress],
      args: [
        name,
        description,
        ipfsCID,
        1000
      ],
      addressMap
    });

    // Create NFT
    const keys = generateKeyPair();
    await sendTransaction({
      name: 'airdrop/airdrop_mint',
      signers: [dropAddress],
      args: [0, keys.publicKey],
      addressMap
    });

    // Setup user account
    await sendTransaction({
      name: 'setup_account',
      signers: [Alice],
      addressMap
    });

    const signature = generateNFTClaim(Alice, 0, keys.privateKey)

    // Redeem NFT
    const [,txError] = await sendTransaction({
      name: 'airdrop/claim_nft',
      signers: [Alice],
      args: [
        dropAddress,
        0,
        signature,
      ],
      addressMap
    });

    // User Delete collection
    const [{ events }, deleteCollectionError] = await sendTransaction({
      name: 'delete_collection',
      signers: [Alice],
      addressMap
    });

    const deleteCollectionEvent = events.find((e) =>
      (e.type as string).endsWith("BarterYardPackNFT.Burn")
    );

    expect(deleteCollectionError).toBeNull()
    expect(deleteCollectionEvent).toBeDefined();
  })
})
