// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {TimelockControllerInitAbstract} from "../governance/TimelockControllerInitAbstract.sol";

contract DUPTimelockController is TimelockControllerInitAbstract {
    function initialize(
        uint256 minDelay,
        address target_,
        address proposer,
        address executor
    ) public initializer {
        address[] memory proposers = new address[](1);
        proposers[0] = address(proposer);
        address[] memory executors = new address[](1);
        executors[0] = executor;
        _initialize(minDelay, proposers, executors);
        setTarget(target_);
    }
}
