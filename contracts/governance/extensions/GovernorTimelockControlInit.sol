// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {GovernorTimelockControlInitAbstract} from "./GovernorTimelockControlInitAbstract.sol";
import {TimelockControllerCore} from "../TimelockControllerCore.sol";

abstract contract GovernorTimelockControlInit is
    GovernorTimelockControlInitAbstract
{
    /**
     * @dev Set the timelock.
     */
    function initialize(TimelockControllerCore timelockAddress)
        public
        initializer
    {
        _initialize(timelockAddress);
    }
}
