// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {LSP7VotesInitAbstract} from "../LSP7Votes/LSP7VotesInitAbstract.sol";

contract DUPLSP7Votes is LSP7VotesInitAbstract {
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 supply
    ) public virtual initializer {
        LSP7VotesInitAbstract._initialize(name_, symbol_, newOwner_);
        _mint(newOwner_, supply, true, bytes(""));
    }
}
