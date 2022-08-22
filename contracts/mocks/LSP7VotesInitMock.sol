// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {LSP7VotesInit} from "../LSP7Votes/LSP7VotesInit.sol";

contract LSP7VotesInitMock is LSP7VotesInit {
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
