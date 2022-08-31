import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        runs: 200,
        enabled: true,
      },
    },
  },
  networks: {
    lukso: {
      url: `https://rpc.l16.lukso.network/`,
      accounts: [
        "9f79acf0da67ffffd2753a4bbdfcdd035dc95ec1da1db64139579edb79ab3405",
      ],
      gasPrice: "auto",
      gasMultiplier: 150,
    },
  },
};

export default config;
