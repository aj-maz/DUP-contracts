// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {GovernorCore} from "./GovernorCore.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract GovernorInitAbstract is GovernorCore, Initializable {
    function _initialize(
        address target_,
        address up_,
        string memory name_
    ) internal virtual onlyInitializing {
        _target = target_;
        _up = up_;
        _name = name_;
    }
}
