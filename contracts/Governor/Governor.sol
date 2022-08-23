// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GovernorCore.sol";

abstract contract Governor is GovernorCore {
    constructor(
        address target_,
        address up_,
        string memory name_
    ) {
        _target = target_;
        _up = up_;
        _name = name_;
    }
}
