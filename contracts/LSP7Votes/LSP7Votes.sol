// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {LSP7VotesCore} from "./LSP7VotesCore.sol";
import {LSP7DigitalAsset} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/LSP7DigitalAsset.sol";
import {LSP7DigitalAssetCore} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/LSP7DigitalAssetCore.sol";

contract LSP7Votes is LSP7VotesCore, LSP7DigitalAsset {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP7DigitalAsset(name_, symbol_, newOwner_, false) {}

    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override(LSP7VotesCore, LSP7DigitalAssetCore) {
        super._mint(to, amount, force, data);
    }

    function _burn(
        address account,
        uint256 amount,
        bytes memory data
    ) internal virtual override(LSP7VotesCore, LSP7DigitalAssetCore) {
        super._burn(account, amount, data);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override(LSP7VotesCore, LSP7DigitalAssetCore) {
        super._transfer(from, to, amount, force, data);
    }
}
