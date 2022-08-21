import { ethers } from "hardhat";
import { expect } from "chai";
import {
  getNamedAccounts,
  LSP7VotesTestContext,
  shouldBehaveLikeLSP7Votes,
} from "./LSP7Votes.behaviour";

describe("LSP7Votes", () => {
  describe("when using LSP7Votes contract with constructor", () => {
    const buildTestContext = async (): Promise<LSP7VotesTestContext> => {
      const accounts = await getNamedAccounts();
      const supply = ethers.BigNumber.from("10000000000000000000000000");
      const deployParams = {
        name: "LSP7 - deployed with constructor",
        symbol: "NFT",
        newOwner: accounts.holder.address,
      };

      const LSP7VotesMock = await ethers.getContractFactory("LSP7VotesMock");

      const lsp7VotesMock = await LSP7VotesMock.connect(accounts.holder).deploy(
        deployParams.name,
        deployParams.symbol,
        deployParams.newOwner
      );

      return {
        accounts,
        lsp7Votes: lsp7VotesMock,
        deployParams,
        supply,
      };
    };

    describe("when deploying the contract", () => {});

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP7Votes(buildTestContext);
    });
  });

  describe("when using LSP7Votes contract with proxy", () => {});
});
