const { ethers } = require("hardhat");
const Web3 = require("web3");

const ABI = require("../artifacts/contracts/dup/DUPFactory.sol/DUPFactory.json");
//const CallReceiverABI = require("../artifacts/contracts/mocks/CallReceiverMock.sol/CallReceiverMock.json");

async function main() {
  const [owner, otherAccount] = await ethers.getSigners();

  console.log(owner.address);

  const web3 = new Web3("https://rpc.l16.lukso.network/");

  const myAccount = web3.eth.accounts.privateKeyToAccount(
    "9f79acf0da67ffffd2753a4bbdfcdd035dc95ec1da1db64139579edb79ab3405"
  );

  web3.eth.accounts.wallet.add(myAccount.privateKey);

  try {
    const myFactory = new web3.eth.Contract(ABI.abi, {
      gas: 50_000_000,
      gasPrice: "1000000000",
    });

    myFactory
      .deploy({
        data: ABI.bytecode,
        arguments: [],
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
