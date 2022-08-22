// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {LSP7Votes} from "../LSP7Votes/LSP7Votes.sol";

contract LSP7VotesMock is LSP7Votes {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP7Votes(name_, symbol_, newOwner_) {}

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        super._mint(to, amount, force, data);
    }

    function burn(
        address to,
        uint256 amount,
        bytes memory data
    ) public {
        super._burn(to, amount, data);
    }
}
