const { ethers } = require("hardhat");
const Web3 = require("web3");

//const ABI = require("../artifacts/contracts/mocks/GovernorMock.sol/GovernorMock.json");
const ABI = require("../artifacts/contracts/governance/TimelockController.sol/TimelockController.json");

async function main() {
  const [owner, otherAccount] = await ethers.getSigners();
  //const GovernorMock = await ethers.getContractFactory("GovernorMock");
  //const TimelockController = await ethers.getContractFactory(
  //  "TimelockController"
  //);

  const web3 = new Web3("https://rpc.l16.lukso.network/");

  const myAccount = web3.eth.accounts.privateKeyToAccount(
    "9f79acf0da67ffffd2753a4bbdfcdd035dc95ec1da1db64139579edb79ab3405"
  );

  web3.eth.accounts.wallet.add(myAccount.privateKey);

  //const governorMock = await GovernorMock.deploy(
  //  "Hi",
  //  "0x77bac3FD15566537CB05486EEeb44bFc437d41a2",
  //  10,
  //  50,
  //  80
  //);

  /* try {
    const myFactory = new web3.eth.Contract(ABI.abi, {
      gas: 5_000_000,
      gasPrice: "1000000000",
    });

    myFactory
      .deploy({
        data: ABI.bytecode,
        arguments: [
          "Hi",
          "0x77bac3FD15566537CB05486EEeb44bFc437d41a2",
          10,
          50,
          80,
        ],
      })
      .send({
        from: myAccount.address,
      })
      .on("error", function (error) {
        console.log(error);
      })
      .on("transactionHash", function (transactionHash) {
        console.log("txHash: ", transactionHash);
      })
      .on("receipt", function (receipt) {
        console.log("receipt: ", receipt.contractAddress); // contains the new contract address
      })
      .on("confirmation", function (confirmationNumber, receipt) {
        console.log("confirmation: ", confirmationNumber);
      })
      .then(function (newContractInstance) {
        console.log(newContractInstance.options.address); // instance with the new contract address
      });
  } catch (err) {
    console.log(err);
  } */

  //const governorMock = GovernorMock.attach(
  //  "0x9cfcDa91BA405606cAb1eDb936c9f27005Eed990"
  //);
  //
  //console.log(await governorMock.votingDelay());

  try {
    const myFactory = new web3.eth.Contract(ABI.abi, {
      gas: 5_000_000,
      gasPrice: "1000000000",
    });

    myFactory
      .deploy({
        data: ABI.bytecode,
        arguments: [
          60 * 20,
          ["0x9cfcDa91BA405606cAb1eDb936c9f27005Eed990"],
          ["0x5cd86aaC1D5450163fdD4DE3e51896Aa39D52CAe"],
        ],
      })
      .send({
        from: myAccount.address,
      })
      .on("error", function (error) {
        console.log(error);
      })
      .on("transactionHash", function (transactionHash) {
        console.log("txHash: ", transactionHash);
      })
      .on("receipt", function (receipt) {
        console.log("receipt: ", receipt.contractAddress); // contains the new contract address
      })
      .on("confirmation", function (confirmationNumber, receipt) {
        console.log("confirmation: ", confirmationNumber);
      })
      .then(function (newContractInstance) {
        console.log(newContractInstance.options.address); // instance with the new contract address
      });
  } catch (err) {
    console.log(err);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
