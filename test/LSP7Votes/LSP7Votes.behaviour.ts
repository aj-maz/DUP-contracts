import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";
import { expect } from "chai";
import type { BigNumber } from "ethers";

import { LSP7VotesMock } from "../../typechain-types/contracts/mocks/LSP7VotesMock";

export type LSP7VotesTestAccounts = {
  holder: SignerWithAddress;
  recepient: SignerWithAddress;
  holderDelegatee: SignerWithAddress;
  recepientDelegatee: SignerWithAddress;
  anyone1: SignerWithAddress;
  anyone2: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP7VotesTestAccounts> => {
  const [
    holder,
    recepient,
    holderDelegatee,
    recepientDelegatee,
    anyone1,
    anyone2,
  ] = await ethers.getSigners();
  return {
    holder,
    recepient,
    holderDelegatee,
    recepientDelegatee,
    anyone1,
    anyone2,
  };
};

export type LSP7VotesDeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
};

export type LSP7VotesTestContext = {
  accounts: LSP7VotesTestAccounts;
  lsp7Votes: LSP7VotesMock;
  deployParams: LSP7VotesDeployParams;
  supply: BigNumber;
};

const ZERO_ADDRESS = ethers.constants.AddressZero;

export const shouldBehaveLikeLSP7Votes = (
  buildContext: () => Promise<LSP7VotesTestContext>
) => {
  let context: LSP7VotesTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("When Delegating", () => {
    it("delegation with balance", async function () {
      const { accounts, supply, lsp7Votes } = context;
      const { holder } = accounts;

      const token = lsp7Votes;
      await token.mint(holder.address, supply, true, "0x");
      expect(await token.delegates(holder.address)).to.be.equal(ZERO_ADDRESS);

      const delegateTx = await token.connect(holder).delegate(holder.address);

      expect(delegateTx)
        .to.emit(token, "DelegateChanged")
        .withArgs(holder.address, ZERO_ADDRESS, holder.address)
        .to.emit(token, "DelegateVotesChanged")
        .withArgs(holder.address, 0, supply);

      expect(await token.delegates(holder.address)).to.be.equal(holder.address);
      expect(String(await token.getVotes(holder.address))).to.be.equal(
        String(supply)
      );
      if (delegateTx && delegateTx.blockNumber) {
        expect(
          String(
            await token.getPastVotes(holder.address, delegateTx.blockNumber - 1)
          )
        ).to.be.equal("0");
        await network.provider.send("evm_mine");
        expect(
          String(
            await token.getPastVotes(holder.address, delegateTx.blockNumber)
          )
        ).to.be.equal(String(supply));
      }
    });
  });
};
