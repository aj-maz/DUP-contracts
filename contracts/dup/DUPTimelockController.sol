// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {TimelockControllerInitAbstract} from "../governance/TimelockControllerInitAbstract.sol";

abstract contract TimelockControllerInit is TimelockControllerInitAbstract {
    function initialize(
        uint256 minDelay,
        address target_,
        address[] memory proposers,
        address[] memory executors
    ) public initializer {
        _initialize(minDelay, proposers, executors);
        setTarget(target_);
    }
}
