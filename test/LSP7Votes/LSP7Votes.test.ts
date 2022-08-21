import { ethers } from "hardhat";
import { expect } from "chai";
import { getNamedAccounts, LSP7TestContext } from "./LSP7Votes.behaviour";

describe("LSP7Votes", () => {
  describe("when using LSP7Votes contract with constructor", () => {
    const buildTestContext = async (): Promise<LSP7TestContext> => {
      const accounts = await getNamedAccounts();
      const initialSupply = ethers.BigNumber.from("3");
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

      // mint tokens for the owner
      await lsp7VotesMock.mint(
        accounts.holder.address,
        initialSupply,
        true,
        "0x"
      );

      return {
        accounts,
        lsp7Votes: lsp7VotesMock,
        deployParams,
        initialSupply,
      };
    };

    describe("when deploying the contract", () => {});

    describe("when testing deployed contract", () => {});
  });

  describe("when using LSP7Votes contract with proxy", () => {});
});
