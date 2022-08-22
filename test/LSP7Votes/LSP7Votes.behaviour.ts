import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";
import { expect } from "chai";
import type { BigNumber } from "ethers";

import { LSP7VotesMock } from "../../typechain-types/contracts/mocks/LSP7VotesMock";

export type LSP7VotesTestAccounts = {
  holder: SignerWithAddress;
  recipient: SignerWithAddress;
  holderDelegatee: SignerWithAddress;
  recipientDelegatee: SignerWithAddress;
  anyone1: SignerWithAddress;
  anyone2: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP7VotesTestAccounts> => {
  const [
    holder,
    recipient,
    holderDelegatee,
    recipientDelegatee,
    anyone1,
    anyone2,
  ] = await ethers.getSigners();
  return {
    holder,
    recipient,
    holderDelegatee,
    recipientDelegatee,
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

      await expect(tx)
        .to.emit(token, "DelegateChanged")
        .withArgs(holder.address, ZERO_ADDRESS, holder.address);

      await expect(tx)
        .to.emit(token, "DelegateVotesChanged")
        .withArgs(holder.address, String(0), String(supply));

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

      await expect(tx)
        .to.emit(token, "DelegateChanged")
        .withArgs(holder.address, ZERO_ADDRESS, holder.address);

      await expect(tx).to.not.emit(token, "DelegateVotesChanged");

      expect(await token.delegates(holder.address)).to.be.equal(holder.address);
    });
  });

  describe("When changing delegation", () => {
    beforeEach(async function () {
      const { accounts, lsp7Votes, supply } = context;
      const { holder } = accounts;
      const token = lsp7Votes;

      await token.mint(holder.address, supply, true, "0x");
      await token.connect(holder).delegate(holder.address);
    });

    it("call", async function () {
      const { accounts, lsp7Votes, supply } = context;
      const { holder, holderDelegatee } = accounts;
      const token = lsp7Votes;

      expect(await token.delegates(holder.address)).to.be.equal(holder.address);

      const tx = await token.connect(holder).delegate(holderDelegatee.address);
      const receipt = await tx.wait();

      await expect(tx)
        .to.emit(token, "DelegateChanged")
        .withArgs(holder.address, holder.address, holderDelegatee.address);
      await expect(tx)
        .to.emit(token, "DelegateVotesChanged")
        .withArgs(holder.address, String(supply), String(0));
      await expect(tx)
        .to.emit(token, "DelegateVotesChanged")
        .withArgs(holderDelegatee.address, String(0), String(supply));

      expect(await token.delegates(holder.address)).to.be.equal(
        holderDelegatee.address
      );

      expect(String(await token.getVotes(holder.address))).to.be.equal("0");
      expect(String(await token.getVotes(holderDelegatee.address))).to.be.equal(
        String(supply)
      );
      expect(
        String(
          await token.getPastVotes(holder.address, receipt.blockNumber - 1)
        )
      ).to.be.equal(String(supply));
      expect(
        String(
          await token.getPastVotes(
            holderDelegatee.address,
            receipt.blockNumber - 1
          )
        )
      ).to.be.equal("0");
      await network.provider.send("evm_mine");
      expect(
        String(await token.getPastVotes(holder.address, receipt.blockNumber))
      ).to.be.equal("0");
      expect(
        String(
          await token.getPastVotes(holderDelegatee.address, receipt.blockNumber)
        )
      ).to.be.equal(String(supply));
    });
  });

  describe("When transfering", () => {
    beforeEach(async function () {
      const { accounts, lsp7Votes, supply } = context;
      const { holder } = accounts;
      const token = lsp7Votes;

      await token.mint(holder.address, supply, true, "0x");
    });

    it("no delegation", async function () {
      const { accounts, lsp7Votes: token } = context;
      const { holder, recipient } = accounts;

      const tx = await token
        .connect(holder)
        .transfer(holder.address, recipient.address, 1, true, "0x");

      await expect(tx)
        .to.emit(token, "Transfer")
        .withArgs(
          holder.address,
          holder.address,
          recipient.address,
          String(1),
          true,
          "0x"
        );

      await expect(tx).to.not.emit(token, "DelegateVotesChanged");

      this.holderVotes = "0";
      this.recipientVotes = "0";
    });

    it("sender delegation", async function () {
      const { accounts, lsp7Votes: token, supply } = context;
      const { holder, recipient } = accounts;

      await token.connect(holder).delegate(holder.address);
      const tx = await token
        .connect(holder)
        .transfer(holder.address, recipient.address, 1, true, "0x");

      await expect(tx)
        .to.emit(token, "Transfer")
        .withArgs(
          holder.address,
          holder.address,
          recipient.address,
          String(1),
          true,
          "0x"
        );
      await expect(tx)
        .to.emit(token, "DelegateVotesChanged")
        .withArgs(holder.address, supply, supply.sub(1));

      this.holderVotes = supply.sub(1);
      this.recipientVotes = "0";
    });

    it("receiver delegation", async function () {
      const { accounts, lsp7Votes: token, supply } = context;
      const { holder, recipient } = accounts;

      await token.connect(holder).delegate(recipient.address);
      const tx = await token
        .connect(holder)
        .transfer(holder.address, recipient.address, 1, true, "0x");

      await expect(tx)
        .to.emit(token, "Transfer")
        .withArgs(
          holder.address,
          holder.address,
          recipient.address,
          String(1),
          true,
          "0x"
        );
      await expect(tx)
        .to.emit(token, "DelegateVotesChanged")
        .withArgs(recipient.address, supply, supply.sub(1));

      this.holderVotes = "0";
      this.recipientVotes = supply.sub(1);
    });

    it("full delegation", async function () {
      const { accounts, lsp7Votes: token, supply } = context;
      const { holder, recipient } = accounts;

      await token.connect(holder).delegate(holder.address);
      await token.connect(recipient).delegate(recipient.address);

      const tx = await token
        .connect(holder)
        .transfer(holder.address, recipient.address, 1, true, "0x");

      await expect(tx)
        .to.emit(token, "Transfer")
        .withArgs(
          holder.address,
          holder.address,
          recipient.address,
          String(1),
          true,
          "0x"
        );
      await expect(tx)
        .to.emit(token, "DelegateVotesChanged")
        .withArgs(holder.address, supply, supply.sub(1));

      await expect(tx)
        .to.emit(token, "DelegateVotesChanged")
        .withArgs(recipient.address, 0, 1);

      this.holderVotes = supply.sub(1);
      this.recipientVotes = "1";
    });

    afterEach(async function () {
      const { accounts, lsp7Votes: token, supply } = context;
      const { holder, recipient } = accounts;

      expect(String(await token.getVotes(holder.address))).to.be.equal(
        this.holderVotes
      );
      expect(String(await token.getVotes(recipient.address))).to.be.equal(
        this.recipientVotes
      );

      // need to advance 2 blocks to see the effect of a transfer on "getPastVotes"
      const blockNumber = await ethers.provider.getBlock("latest");
      await network.provider.send("evm_mine");

      expect(
        String(await token.getPastVotes(holder.address, blockNumber.number))
      ).to.be.equal(String(this.holderVotes));
      expect(
        String(await token.getPastVotes(recipient.address, blockNumber.number))
      ).to.be.equal(String(this.recipientVotes));
    });
  });
};
