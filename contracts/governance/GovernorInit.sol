// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {GovernorInitAbstract} from "./GovernorInitAbstract.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract GovernorInit is GovernorInitAbstract, Initializable {
    function initialize(
        address target_,
        address up_,
        string memory name_
    ) public initializer {
        _initialize(target_, up_, name_);
    }
}
