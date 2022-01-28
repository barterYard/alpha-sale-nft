import path from "path";
import {
  emulator,
  executeScript,
  init,
  sendTransaction,
} from "flow-js-testing";
import { deployContracts } from "./utils/deployContracts";
import { getAddressMap } from "./utils/helpers";

// Increase timeout if your tests failing due to timeout
jest.setTimeout(10000);

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
    const [{ events }, error] = await deployContracts();

    const initEvent = events.find((e) =>
      (e.type as string).endsWith("BarterYardPackNFT.ContractInitialized")
    );

    expect(initEvent).toBeDefined();
  });

  test("should setup account", async () => {
    await deployContracts();
    const addressMap = await getAddressMap()

    const signers = [ addressMap.BarterYardPackNFT ];

    const [_tx, txError] = await sendTransaction({ name: 'setup_account', signers, addressMap });

    expect(txError).toBeNull()

    const args = [ addressMap.BarterYardPackNFT ];
    const [result, scriptError] = await executeScript({ name: 'check_account', args });

    expect(result).toBeTruthy()
    expect(scriptError).toBeNull()
  });
})
