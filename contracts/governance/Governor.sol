// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GovernorCore.sol";

abstract contract Governor is GovernorCore {
    constructor(string memory name_) {
        _name = name_;
    }
}
