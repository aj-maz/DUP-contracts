import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network } from "hardhat";
import { expect } from "chai";
import type { BigNumber } from "ethers";
import mineBlocks from "../utils/mineBlocks";

import { TimelockController } from "../../typechain-types/contracts/governance/TimelockController";
import { TimelockControllerInit } from "../../typechain-types/contracts/governance/TimelockControllerInit";

import { CallReceiverMock } from "../../typechain-types/contracts/mocks/CallReceiverMock";

export type TimelockTestAccounts = {
  admin: SignerWithAddress;
  proposer: SignerWithAddress;
  canceller: SignerWithAddress;
  executor: SignerWithAddress;
  other: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<TimelockTestAccounts> => {
  const [admin, proposer, canceller, executor, other] =
    await ethers.getSigners();
  return {
    admin,
    proposer,
    canceller,
    executor,
    other,
  };
};

export type TimelockRoles = {
  TIMELOCK_ADMIN_ROLE: string;
  PROPOSER_ROLE: string;
  EXECUTOR_ROLE: string;
  CANCELLER_ROLE: string;
};

export type TimelockDeployParams = {
  minDelay: BigNumber;
  proposers: string[];
  executors: string[];
};

export type TimelockControllerTestContext = {
  accounts: TimelockTestAccounts;
  deployParams: TimelockDeployParams;
  timelockController: TimelockController | TimelockControllerInit;
  callReceiver: CallReceiverMock;
  roles: TimelockRoles;
};

export const shouldBehaveLikeTimelockController = (
  buildContext: () => Promise<TimelockControllerTestContext>
) => {
  let context: TimelockControllerTestContext;

  beforeEach(async function () {
    context = await buildContext();
  });

  it("initial state", async function () {
    const { timelockController, deployParams, roles, accounts } = context;
    const { admin, proposer, canceller, executor, other } = accounts;

    const {
      TIMELOCK_ADMIN_ROLE,
      PROPOSER_ROLE,
      EXECUTOR_ROLE,
      CANCELLER_ROLE,
    } = roles;

    expect(String(await timelockController.getMinDelay())).to.be.equal(
      String(deployParams.minDelay)
    );

    expect(await timelockController.TIMELOCK_ADMIN_ROLE()).to.be.equal(
      TIMELOCK_ADMIN_ROLE
    );
    expect(await timelockController.PROPOSER_ROLE()).to.be.equal(PROPOSER_ROLE);
    expect(await timelockController.EXECUTOR_ROLE()).to.be.equal(EXECUTOR_ROLE);
    expect(await timelockController.CANCELLER_ROLE()).to.be.equal(
      CANCELLER_ROLE
    );

    expect(
      await Promise.all(
        [PROPOSER_ROLE, CANCELLER_ROLE, EXECUTOR_ROLE].map((role) =>
          timelockController.hasRole(role, proposer.address)
        )
      )
    ).to.be.deep.equal([true, false, false]);

    expect(
      await Promise.all(
        [PROPOSER_ROLE, CANCELLER_ROLE, EXECUTOR_ROLE].map((role) =>
          timelockController.hasRole(role, canceller.address)
        )
      )
    ).to.be.deep.equal([false, true, false]);

    expect(
      await Promise.all(
        [PROPOSER_ROLE, CANCELLER_ROLE, EXECUTOR_ROLE].map((role) =>
          timelockController.hasRole(role, executor.address)
        )
      )
    ).to.be.deep.equal([false, false, true]);
  });
};
