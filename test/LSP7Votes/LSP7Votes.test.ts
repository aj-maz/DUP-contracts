import { ethers } from "hardhat";
import { expect } from "chai";
import {
  getNamedAccounts,
  LSP7VotesTestContext,
  shouldBehaveLikeLSP7Votes,
} from "./LSP7Votes.behaviour";

import { deployProxy } from "../utils/fixtures";

import { LSP7VotesInitMock } from "../../typechain-types/contracts/mocks/LSP7VotesInitMock";

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

  describe("when using LSP7Votes contract with proxy", () => {
    const buildTestContext = async (): Promise<LSP7VotesTestContext> => {
      const accounts = await getNamedAccounts();
      const supply = ethers.BigNumber.from("10000000000000000000000000");
      const deployParams = {
        name: "LSP7 - deployed with constructor",
        symbol: "NFT",
        newOwner: accounts.holder.address,
      };

      const LSP7VotesInitMock = await ethers.getContractFactory(
        "LSP7VotesInitMock"
      );

      const lsp7VotesInitMock = await LSP7VotesInitMock.connect(
        accounts.holder
      ).deploy();

      const lsp7Proxy = await deployProxy(
        lsp7VotesInitMock.address,
        accounts.holder
      );

      const lsp7 = lsp7VotesInitMock.attach(lsp7Proxy);
      return {
        accounts,
        lsp7Votes: lsp7,
        deployParams,
        supply,
      };
    };

    const initializeProxy = async (context: LSP7VotesTestContext) => {
      if ((context.lsp7Votes as LSP7VotesInitMock).initialize) {
        return (context.lsp7Votes as LSP7VotesInitMock).initialize(
          context.deployParams.name,
          context.deployParams.symbol,
          context.deployParams.newOwner
        );
      }
    };

    describe("when deploying the base implementation contract", () => {
      it("prevent any address from calling the initialize(...) function on the implementation", async () => {
        const accounts = await ethers.getSigners();

        const LSP7VotesInitMock = await ethers.getContractFactory(
          "LSP7VotesInitMock"
        );

        const lsp7VotesInit = await LSP7VotesInitMock.deploy();

        const randomCaller = accounts[1];

        await expect(
          lsp7VotesInit.initialize("XXXXXXXXXXX", "XXX", randomCaller.address)
        ).to.be.revertedWith("Initializable: contract is already initialized");
      });
    });

    describe("when deploying the contract as proxy", () => {
      let context: LSP7VotesTestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when testing deployed contract", () => {
        shouldBehaveLikeLSP7Votes(() =>
          buildTestContext().then(async (context) => {
            await initializeProxy(context);

            return context;
          })
        );
      });
    });
  });
});
