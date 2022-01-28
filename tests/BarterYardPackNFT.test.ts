import path from "path";
import {
  emulator,
  init,
} from "flow-js-testing";
import { deployContracts } from "./utils/deployContracts";

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
})
