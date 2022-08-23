// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {GovernorCore} from "./GovernorCore.sol";

abstract contract GovernorInitAbstract is GovernorCore {
    function _initialize(
        address target_,
        address up_,
        string memory name_
    ) internal virtual {
        _target = target_;
        _up = up_;
        _name = name_;
    }
}
