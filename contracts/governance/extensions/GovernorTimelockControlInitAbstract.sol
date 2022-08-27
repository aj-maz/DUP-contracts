// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {GovernorTimelockControlCore} from "./GovernorTimelockControlCore.sol";
import {TimelockControllerCore} from "../TimelockControllerCore.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract GovernorTimelockControlInitAbstract is
    GovernorTimelockControlCore,
    Initializable
{
    /**
     * @dev Set the timelock.
     */
    function _initialize(TimelockControllerCore timelockAddress)
        internal
        onlyInitializing
    {
        _updateTimelock(timelockAddress);
    }
}
