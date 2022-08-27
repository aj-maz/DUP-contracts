import { LSPFactory } from "@lukso/lsp-factory.js";
import { ethers } from "hardhat";
import {
  getNamedAccounts,
  GovernanceDeployParams,
  GovernanceTestContext,
  shouldBehaveLikeGovernance,
} from "./Governance.behaviour";

import { deployProxy } from "../utils/fixtures";

import { GovernorMockInit } from "../../typechain-types/contracts/mocks/GovernorMockInit";

const daoProfileName = "My Universal DAO";
const daoProfileDescription = "My cool Universal Profile";
const DAOProfileInfo = {
  name: daoProfileName,
  description: daoProfileDescription,
  profileImage: [
    {
      width: 500,
      height: 500,
      hashFunction: "keccak256(bytes)",
      hash: "0xfdafad027ecfe57eb4ad047b938805d1dec209d6e9f960fc320d7b9b11cbed14",
      url: "ipfs://QmPLqMFHxiUgYAom3Zg4SiwoxDaFcZpHXpCmiDzxrtjSGp",
    },
  ],
  backgroundImage: [
    {
      width: 500,
      height: 500,
      hashFunction: "keccak256(bytes)",
      hash: "0xfdafad027ecfe57eb4ad047b938805d1dec209d6e9f960fc320d7b9b11cbed14",
      url: "ipfs://QmPLqMFHxiUgYAom3Zg4SiwoxDaFcZpHXpCmiDzxrtjSGp",
    },
  ],
};

describe("Governance", () => {
  const buildTestContext = async (): Promise<GovernanceTestContext> => {
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const deployKey =
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const lspFactory = new LSPFactory(ethers.provider, {
      deployKey: deployKey, // Private key of the account which will deploy UPs
      chainId: chainId, // Chain Id of the network you want to connect to
    });

    const accounts = await getNamedAccounts();

    const { owner, voter1, voter2, voter3, voter4 } = accounts;

    const GovernorMock = await ethers.getContractFactory("GovernorMock");
    const LSP7VotesMock = await ethers.getContractFactory("LSP7VotesMock");

    const governanceToken = await LSP7VotesMock.deploy(
      "Sample Governance Token",
      "SGT",
      owner.address
    );

    const deployParams: GovernanceDeployParams = {
      daoProfileName,
      governanceToken: governanceToken.address,
      votingDelay: ethers.BigNumber.from("4"),
      votingPeriod: ethers.BigNumber.from("16"),
      quorumNumerator: "10",
    };

    const governor = await GovernorMock.deploy(
      deployParams.daoProfileName,
      deployParams.governanceToken,
      deployParams.votingDelay,
      deployParams.votingPeriod,
      deployParams.quorumNumerator
    );

    const myContracts = await lspFactory.UniversalProfile.deploy({
      controllerAddresses: [governor.address], // Address which will controll the UP
      lsp3Profile: DAOProfileInfo,
    });

    if (myContracts.LSP0ERC725Account && myContracts.LSP6KeyManager) {
      const keyManagerAddress = myContracts.LSP6KeyManager.address;
      const accountAddress = myContracts.LSP0ERC725Account.address;

      owner.sendTransaction({ to: accountAddress, value: 1000 });

      governor.setInitialUpAndManager(keyManagerAddress, accountAddress);

      const CallReceiverMock = await ethers.getContractFactory(
        "CallReceiverMock"
      );
      const callReceiver = await CallReceiverMock.deploy();

      await governanceToken.mint(voter1.address, "10", true, "0x");
      await governanceToken.connect(voter1).delegate(voter1.address);
      await governanceToken.mint(voter2.address, "7", true, "0x");
      await governanceToken.connect(voter2).delegate(voter2.address);
      await governanceToken.mint(voter3.address, "5", true, "0x");
      await governanceToken.connect(voter3).delegate(voter3.address);
      await governanceToken.mint(voter4.address, "2", true, "0x");
      await governanceToken.connect(voter4).delegate(voter4.address);

      return {
        accounts,
        deployParams,
        keyManagerAddress,
        accountAddress,
        governanceToken,
        callReceiver,
        governor,
      };
    } else {
      throw new Error("Failed to create UP.");
    }
  };

  describe("when using Governance contract with constructor", () => {
    describe("when testing deployed contract", () => {
      shouldBehaveLikeGovernance(buildTestContext);
    });
  });

  describe("when using Governance contract with proxy", () => {
    const buildTestContext = async (): Promise<GovernanceTestContext> => {
      const chainId = (await ethers.provider.getNetwork()).chainId;
      const deployKey =
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
      const lspFactory = new LSPFactory(ethers.provider, {
        deployKey: deployKey, // Private key of the account which will deploy UPs
        chainId: chainId, // Chain Id of the network you want to connect to
      });

      const accounts = await getNamedAccounts();

      const { owner, voter1, voter2, voter3, voter4 } = accounts;

      const GovernorMockInit = await ethers.getContractFactory(
        "GovernorMockInit"
      );
      const LSP7VotesMock = await ethers.getContractFactory("LSP7VotesMock");

      const governanceToken = await LSP7VotesMock.deploy(
        "Sample Governance Token",
        "SGT",
        owner.address
      );

      const deployParams: GovernanceDeployParams = {
        daoProfileName,
        governanceToken: governanceToken.address,
        votingDelay: ethers.BigNumber.from("4"),
        votingPeriod: ethers.BigNumber.from("16"),
        quorumNumerator: "10",
      };

      const governor = await GovernorMockInit.deploy();

      const myContracts = await lspFactory.UniversalProfile.deploy({
        controllerAddresses: [governor.address], // Address which will controll the UP
        lsp3Profile: DAOProfileInfo,
      });

      if (myContracts.LSP0ERC725Account && myContracts.LSP6KeyManager) {
        const keyManagerAddress = myContracts.LSP6KeyManager.address;
        const accountAddress = myContracts.LSP0ERC725Account.address;

        owner.sendTransaction({ to: accountAddress, value: 1000 });

        const CallReceiverMock = await ethers.getContractFactory(
          "CallReceiverMock"
        );
        const callReceiver = await CallReceiverMock.deploy();

        await governanceToken.mint(voter1.address, "10", true, "0x");
        await governanceToken.connect(voter1).delegate(voter1.address);
        await governanceToken.mint(voter2.address, "7", true, "0x");
        await governanceToken.connect(voter2).delegate(voter2.address);
        await governanceToken.mint(voter3.address, "5", true, "0x");
        await governanceToken.connect(voter3).delegate(voter3.address);
        await governanceToken.mint(voter4.address, "2", true, "0x");
        await governanceToken.connect(voter4).delegate(voter4.address);

        return {
          accounts,
          deployParams,
          keyManagerAddress,
          accountAddress,
          governanceToken,
          callReceiver,
          governor,
        };
      } else {
        throw new Error("Failed to create UP.");
      }
    };

    const initializeProxy = async (context: GovernanceTestContext) => {
      if ((context.governor as GovernorMockInit).initialize) {
        return (context.governor as GovernorMockInit).initialize(
          context.keyManagerAddress,
          context.accountAddress,
          context.deployParams.daoProfileName,
          context.deployParams.governanceToken,
          context.deployParams.votingDelay,
          context.deployParams.votingPeriod,
          context.deployParams.quorumNumerator
        );
      }
    };

    describe("when deploying the contract as proxy", () => {
      let context: GovernanceTestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when testing deployed contract", () => {
        shouldBehaveLikeGovernance(() =>
          buildTestContext().then(async (context) => {
            await initializeProxy(context);

            return context;
          })
        );
      });
    });
  });
});
