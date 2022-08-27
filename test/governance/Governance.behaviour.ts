import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import type { BigNumber } from "ethers";
import mineBlocks from "../utils/mineBlocks";

import { GovernorMock } from "../../typechain-types/contracts/mocks/GovernorMock";
import { GovernorMockInit } from "../../typechain-types/contracts/mocks/GovernorMockInit";

import { LSP7VotesMock } from "../../typechain-types/contracts/mocks/LSP7VotesMock";
import { CallReceiverMock } from "../../typechain-types/contracts/mocks/CallReceiverMock";

export type GovernanceTestAccounts = {
  owner: SignerWithAddress;
  proposer: SignerWithAddress;
  voter1: SignerWithAddress;
  voter2: SignerWithAddress;
  voter3: SignerWithAddress;
  voter4: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<GovernanceTestAccounts> => {
  const [owner, proposer, voter1, voter2, voter3, voter4] =
    await ethers.getSigners();
  return {
    owner,
    proposer,
    voter1,
    voter2,
    voter3,
    voter4,
  };
};

export type GovernanceDeployParams = {
  daoProfileName: string;
  governanceToken: string;
  votingDelay: BigNumber;
  votingPeriod: BigNumber;
  quorumNumerator: string;
};

export type GovernanceTestContext = {
  accounts: GovernanceTestAccounts;
  deployParams: GovernanceDeployParams;
  keyManagerAddress: string;
  accountAddress: string;
  governanceToken: LSP7VotesMock;
  callReceiver: CallReceiverMock;
  governor: GovernorMock | GovernorMockInit;
};

export const shouldBehaveLikeGovernance = (
  buildContext: () => Promise<GovernanceTestContext>
) => {
  let context: GovernanceTestContext;
  let value = 1;

  beforeEach(async function () {
    context = await buildContext();

    const { governor } = context;
    const { owner } = context.accounts;

    await owner.sendTransaction({ to: governor.address, value });
  });

  it("deployment check", async function () {
    const { governor, deployParams } = context;
    expect(await governor.name()).to.be.equal(deployParams.daoProfileName);
    expect(await governor.token()).to.be.equal(deployParams.governanceToken);
    expect(String(await governor.votingDelay())).to.be.equal(
      String(deployParams.votingDelay)
    );
    expect(String(await governor.votingPeriod())).to.be.equal(
      String(deployParams.votingPeriod)
    );
    expect(String(await governor.quorum(0))).to.be.equal("0");
    expect(await governor.COUNTING_MODE()).to.be.equal(
      "support=bravo&quorum=for,abstain"
    );
  });

  it("nominal workflow", async function () {
    const { governor, callReceiver, deployParams, governanceToken } = context;
    const { owner, voter1, voter2, voter3, voter4, proposer } =
      context.accounts;

    const GovernanceABI = [
      "function execute(uint256 operation, address to,uint256 value, bytes data)",
    ];

    let GovernanceIface = new ethers.utils.Interface(GovernanceABI);

    const RecallABI = ["function mockFunction()"];

    let RecallIface = new ethers.utils.Interface(RecallABI);

    const executeData = GovernanceIface.encodeFunctionData("execute", [
      "0",
      callReceiver.address,
      value,
      RecallIface.encodeFunctionData("mockFunction", []),
    ]);

    const proposalObject = {
      calldatas: [executeData],
      description: "ipfs://www",
    };

    const proposalId = await governor.hashProposal(
      proposalObject.calldatas,
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(proposalObject.description)
      )
    );

    expect(await governor.hasVoted(proposalId, owner.address)).to.be.equal(
      false
    );
    expect(await governor.hasVoted(proposalId, voter1.address)).to.be.equal(
      false
    );
    expect(await governor.hasVoted(proposalId, voter2.address)).to.be.equal(
      false
    );

    expect(
      String(await ethers.provider.getBalance(governor.address))
    ).to.be.equal(String(value));
    expect(
      String(await ethers.provider.getBalance(callReceiver.address))
    ).to.be.equal("0");

    const tx = await governor
      .connect(proposer)
      .propose(proposalObject.calldatas, proposalObject.description);

    const receipt = await tx.wait();

    await expect(tx)
      .to.emit(governor, "ProposalCreated")
      .withArgs(
        proposalId,
        proposer.address,
        proposalObject.calldatas,
        ethers.BigNumber.from(receipt.blockNumber).add(
          deployParams.votingDelay
        ),
        ethers.BigNumber.from(receipt.blockNumber)
          .add(deployParams.votingDelay)
          .add(deployParams.votingPeriod),
        proposalObject.description
      );

    await mineBlocks(deployParams.votingDelay.toNumber());

    const voteTx1 = await governor
      .connect(voter1)
      .castVoteWithReason(proposalId, 1, "This is nice");

    const voteTxReceipt1 = await voteTx1.wait();

    await expect(voteTx1)
      .to.emit(governor, "VoteCast")
      .withArgs(voter1.address, proposalId, 1, 10, "This is nice");

    const voteTx2 = await governor.connect(voter2).castVote(proposalId, 1);

    const voteTxReceipt2 = await voteTx2.wait();

    await expect(voteTx2)
      .to.emit(governor, "VoteCast")
      .withArgs(voter2.address, proposalId, 1, 7, "");

    const voteTx3 = await governor.connect(voter3).castVote(proposalId, 0);

    const voteTxReceipt3 = await voteTx3.wait();

    await expect(voteTx3)
      .to.emit(governor, "VoteCast")
      .withArgs(voter3.address, proposalId, 0, 5, "");

    const voteTx4 = await governor.connect(voter4).castVote(proposalId, 2);

    const voteTxReceipt4 = await voteTx4.wait();

    await expect(voteTx4)
      .to.emit(governor, "VoteCast")
      .withArgs(voter4.address, proposalId, 2, 2, "");

    await mineBlocks(deployParams.votingPeriod.toNumber());

    const executeTx = await governor
      .connect(proposer)
      .execute(
        proposalObject.calldatas,
        ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes(proposalObject.description)
        )
      );

    await expect(executeTx)
      .to.emit(governor, "ProposalExecuted")
      .withArgs(proposalId);

    await expect(executeTx).to.emit(callReceiver, "MockFunctionCalled");

    expect(await governor.hasVoted(proposalId, owner.address)).to.be.equal(
      false
    );
    expect(await governor.hasVoted(proposalId, voter1.address)).to.be.equal(
      true
    );
    expect(await governor.hasVoted(proposalId, voter2.address)).to.be.equal(
      true
    );

    expect(
      String(await ethers.provider.getBalance(governor.address))
    ).to.be.equal(String(value));
    expect(
      String(await ethers.provider.getBalance(callReceiver.address))
    ).to.be.equal(String(value));
  });
};
