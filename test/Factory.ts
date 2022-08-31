import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("dupFactory", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFactory() {
    const [owner, otherAccount, o2, o3, o4] = await ethers.getSigners();

    const DUPFactory = await ethers.getContractFactory("DUPFactory");
    const dupFactory = await DUPFactory.deploy();

    return { dupFactory, owner, otherAccount, o2, o3, o4 };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { dupFactory, owner, otherAccount, o2, o3, o4 } = await loadFixture(
        deployFactory
      );

      console.log(await dupFactory.dupTimelockImpl());

      await dupFactory.deployTLG(
        "GovTok",
        "GTK",
        owner.address,
        ethers.utils.parseEther("10")
      );

      await dupFactory.setup(
        0,
        o2.address,
        o3.address,
        "GTK",
        5,
        15,
        80,
        180,
        otherAccount.address,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero
      );

      console.log(await dupFactory.getDaosInfo());
    });
  });
});
