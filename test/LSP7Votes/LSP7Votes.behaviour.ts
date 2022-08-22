import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";
import { expect } from "chai";
import type { BigNumber } from "ethers";

import { LSP7VotesMock } from "../../typechain-types/contracts/mocks/LSP7VotesMock";
import { LSP7VotesInitMock } from "../../typechain-types/contracts/mocks/LSP7VotesInitMock";

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
  lsp7Votes: LSP7VotesMock | LSP7VotesInitMock;
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
      const { accounts, lsp7Votes: token, supply } = context;
      const { holder } = accounts;

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

  describe("When minting", () => {
    beforeEach(async function () {
      const { accounts, lsp7Votes: token } = context;
      const { holder } = accounts;

      await token.connect(holder).delegate(holder.address);
    });

    it("reverts if block number >= current block", async function () {
      const { accounts, lsp7Votes: token } = context;
      const { holder } = accounts;

      await expect(token.getPastTotalSupply(5e10)).to.be.revertedWith(
        "LSP7Votes: block not yet mined"
      );
    });

    it("returns 0 if there are no checkpoints", async function () {
      const { lsp7Votes: token } = context;
      expect(String(await token.getPastTotalSupply(0))).to.be.equal("0");
    });

    it("returns the latest block if >= last checkpoint block", async function () {
      const { accounts, lsp7Votes: token, supply } = context;
      const { holder, recipient } = accounts;

      const t1 = await token.mint(holder.address, supply, true, "0x");

      const receipt = await t1.wait();

      await network.provider.send("evm_mine");
      await network.provider.send("evm_mine");

      expect(
        String(await token.getPastTotalSupply(receipt.blockNumber))
      ).to.be.equal(supply);
      expect(
        String(await token.getPastTotalSupply(receipt.blockNumber + 1))
      ).to.be.equal(supply);
    });

    it("generally returns the voting balance at the appropriate checkpoint", async function () {
      const { accounts, lsp7Votes: token, supply } = context;
      const { holder, recipient } = accounts;

      const t1 = await token.mint(holder.address, supply, true, "0x");
      const t1Receipt = await t1.wait();

      await network.provider.send("evm_mine");
      await network.provider.send("evm_mine");
      const t2 = await token.burn(holder.address, 10, "0x");
      const t2Receipt = await t2.wait();

      await network.provider.send("evm_mine");
      await network.provider.send("evm_mine");
      const t3 = await token.burn(holder.address, 10, "0x");
      const t3Receipt = await t3.wait();

      await network.provider.send("evm_mine");
      await network.provider.send("evm_mine");
      const t4 = await token.mint(holder.address, 20, true, "0x");
      const t4Receipt = await t4.wait();

      await network.provider.send("evm_mine");
      await network.provider.send("evm_mine");

      expect(
        String(await token.getPastTotalSupply(t1Receipt.blockNumber - 1))
      ).to.be.equal("0");
      expect(
        String(await token.getPastTotalSupply(t1Receipt.blockNumber))
      ).to.be.equal("10000000000000000000000000");
      expect(
        String(await token.getPastTotalSupply(t1Receipt.blockNumber + 1))
      ).to.be.equal("10000000000000000000000000");
      expect(
        String(await token.getPastTotalSupply(t2Receipt.blockNumber))
      ).to.be.equal("9999999999999999999999990");
      expect(
        String(await token.getPastTotalSupply(t2Receipt.blockNumber + 1))
      ).to.be.equal("9999999999999999999999990");
      expect(
        String(await token.getPastTotalSupply(t3Receipt.blockNumber))
      ).to.be.equal("9999999999999999999999980");
      expect(
        String(await token.getPastTotalSupply(t3Receipt.blockNumber + 1))
      ).to.be.equal("9999999999999999999999980");
      expect(
        String(await token.getPastTotalSupply(t4Receipt.blockNumber))
      ).to.be.equal("10000000000000000000000000");
      expect(
        String(await token.getPastTotalSupply(t4Receipt.blockNumber + 1))
      ).to.be.equal("10000000000000000000000000");
    });
  });
};
