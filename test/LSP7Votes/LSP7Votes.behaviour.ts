import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import type { BigNumber } from "ethers";

import { LSP7VotesMock } from "../../typechain-types/mocks/LSP7VotesMock";

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
      //expect(await token.delegates(holder.address)).to.be.equal(ZERO_ADDRESS);
      //
      //const { receipt } = await token.delegate(holder, { from: holder });
      //expectEvent(receipt, "DelegateChanged", {
      //  delegator: holder,
      //  fromDelegate: ZERO_ADDRESS,
      //  toDelegate: holder,
      //});
      //expectEvent(receipt, "DelegateVotesChanged", {
      //  delegate: holder,
      //  previousBalance: "0",
      //  newBalance: supply,
      //});

      //expect(await token.delegates(holder)).to.be.equal(holder);
      //
      //expect(await token.getVotes(holder)).to.be.bignumber.equal(supply);
      //expect(
      //  await token.getPastVotes(holder, receipt.blockNumber - 1)
      //).to.be.bignumber.equal("0");
      //await time.advanceBlock();
      //expect(
      //  await token.getPastVotes(holder, receipt.blockNumber)
      //).to.be.bignumber.equal(supply);
    });
  });
};
