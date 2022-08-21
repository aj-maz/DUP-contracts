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

      const tx = await token.connect(holder).delegate(holder.address);
      const receipt = await tx.wait();

      if (receipt.events) {
        const delegateChangeEvent = receipt.events.find(
          (e) => e.event === "DelegateChanged"
        );
        expect(delegateChangeEvent).to.not.be.equal(undefined);
        expect(delegateChangeEvent?.args?.delegator).to.be.equal(
          holder.address
        );
        expect(delegateChangeEvent?.args?.fromDelegate).to.be.equal(
          ZERO_ADDRESS
        );
        expect(delegateChangeEvent?.args?.toDelegate).to.be.equal(
          holder.address
        );
        const delegateVotesChangeEvent = receipt.events.find(
          (e) => e.event === "DelegateVotesChanged"
        );
        expect(delegateVotesChangeEvent).to.not.be.equal(undefined);
        expect(delegateVotesChangeEvent?.args?.delegate).to.be.equal(
          holder.address
        );
        expect(delegateVotesChangeEvent?.args?.previousBalance).to.be.equal(
          String(0)
        );
        expect(delegateVotesChangeEvent?.args?.newBalance).to.be.equal(
          String(supply)
        );
      }

      expect(await token.delegates(holder.address)).to.be.equal(holder.address);
      expect(String(await token.getVotes(holder.address))).to.be.equal(
        String(supply)
      );
      if (tx && tx.blockNumber) {
        expect(
          String(await token.getPastVotes(holder.address, tx.blockNumber - 1))
        ).to.be.equal("0");
        await network.provider.send("evm_mine");
        expect(
          String(await token.getPastVotes(holder.address, tx.blockNumber))
        ).to.be.equal(String(supply));
      }
    });

    it("delegation without balance", async function () {
      const { accounts, lsp7Votes } = context;
      const { holder } = accounts;
      const token = lsp7Votes;
      expect(await token.delegates(holder.address)).to.be.equal(ZERO_ADDRESS);
      const tx = await token.connect(holder).delegate(holder.address);
      const receipt = await tx.wait();

      if (receipt.events) {
        const delegateChangeEvent = receipt.events.find(
          (e) => e.event === "DelegateChanged"
        );
        expect(delegateChangeEvent).to.not.be.equal(undefined);
        expect(delegateChangeEvent?.args?.delegator).to.be.equal(
          holder.address
        );
        expect(delegateChangeEvent?.args?.fromDelegate).to.be.equal(
          ZERO_ADDRESS
        );
        expect(delegateChangeEvent?.args?.toDelegate).to.be.equal(
          holder.address
        );
        const delegateVotesChangeEvent = receipt.events.find(
          (e) => e.event === "DelegateVotesChanged"
        );
        expect(delegateVotesChangeEvent).to.be.equal(undefined);
      }
      
      expect(await token.delegates(holder.address)).to.be.equal(holder.address);
    });
  });
};
