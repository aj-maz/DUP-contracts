// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {GovernorInitAbstract} from "./GovernorInitAbstract.sol";

abstract contract GovernorInit is GovernorInitAbstract {
    function initialize(
        address target_,
        address up_,
        string memory name_
    ) public initializer {
        _initialize(target_, up_, name_);
    }
}
