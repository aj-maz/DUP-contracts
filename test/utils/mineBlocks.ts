import { network } from "hardhat";

async function mineBlocks(blockNumber: number) {
  while (blockNumber > 0) {
    blockNumber--;
    await network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
}

export default mineBlocks;
