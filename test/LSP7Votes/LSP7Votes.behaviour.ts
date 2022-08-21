import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import type { BigNumber } from "ethers";

import { LSP7VotesMock } from "../../typechain-types/mocks/LSP7VotesMock";

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

export type LSP7DeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
};

export type LSP7TestContext = {
  accounts: LSP7VotesTestAccounts;
  lsp7Votes: LSP7VotesMock;
  deployParams: LSP7DeployParams;
  initialSupply: BigNumber
};
