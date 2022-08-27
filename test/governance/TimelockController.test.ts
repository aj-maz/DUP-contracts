import { ethers } from "hardhat";
import { expect } from "chai";
import {
  getNamedAccounts,
  TimelockDeployParams,
  TimelockControllerTestContext,
  shouldBehaveLikeTimelockController,
} from "./TimelockController.behaviour";

import { deployProxy } from "../utils/fixtures";

describe("Governance", () => {
  const buildTestContext = async (): Promise<TimelockControllerTestContext> => {
    const accounts = await getNamedAccounts();

    const { admin, proposer, canceller, executor, other } = accounts;

    ethers.utils.solidityKeccak256(["string"], ["1234"]);

    const TIMELOCK_ADMIN_ROLE = ethers.utils.solidityKeccak256(
      ["string"],
      ["TIMELOCK_ADMIN_ROLE"]
    );
    const PROPOSER_ROLE = ethers.utils.solidityKeccak256(
      ["string"],
      ["PROPOSER_ROLE"]
    );
    const EXECUTOR_ROLE = ethers.utils.solidityKeccak256(
      ["string"],
      ["EXECUTOR_ROLE"]
    );
    const CANCELLER_ROLE = ethers.utils.solidityKeccak256(
      ["string"],
      ["CANCELLER_ROLE"]
    );

    const MINDELAY = ethers.BigNumber.from(24 * 3600);

    const TimelockController = await ethers.getContractFactory(
      "TimelockController"
    );

    const deployParams: TimelockDeployParams = {
      minDelay: MINDELAY,
      proposers: [proposer.address],
      executors: [executor.address],
    };

    const timelockController = await TimelockController.connect(admin).deploy(
      deployParams.minDelay,
      deployParams.proposers,
      deployParams.executors
    );

    expect(
      await timelockController
        .connect(admin)
        .hasRole(CANCELLER_ROLE, proposer.address)
    ).to.be.equal(true);

    await timelockController
      .connect(admin)
      .revokeRole(CANCELLER_ROLE, proposer.address);

    await timelockController
      .connect(admin)
      .grantRole(CANCELLER_ROLE, canceller.address);

    const CallReceiverMock = await ethers.getContractFactory(
      "CallReceiverMock"
    );
    const callReceiver = await CallReceiverMock.deploy();

    return {
      accounts,
      deployParams,
      timelockController,
      callReceiver,
      roles: {
        TIMELOCK_ADMIN_ROLE,
        PROPOSER_ROLE,
        EXECUTOR_ROLE,
        CANCELLER_ROLE,
      },
    };
  };

  describe("when using Governance contract with constructor", () => {
    describe("when testing deployed contract", () => {
      shouldBehaveLikeTimelockController(buildTestContext);
    });
  });
});
