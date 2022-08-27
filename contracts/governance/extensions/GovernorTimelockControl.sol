// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {GovernorTimelockControlCore} from "./GovernorTimelockControlCore.sol";
import {TimelockControllerCore} from "../TimelockControllerCore.sol";

abstract contract GovernorTimelockControl is GovernorTimelockControlCore {
    /**
     * @dev Set the timelock.
     */
    constructor(TimelockControllerCore timelockAddress) {
        _updateTimelock(timelockAddress);
    }
}
