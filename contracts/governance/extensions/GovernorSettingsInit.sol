// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {GovernorSettingsInitAbstract} from "./GovernorSettingsInitAbstract.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract GovernorSettingsInit is
    GovernorSettingsInitAbstract,
    Initializable
{
    function initialize(
        uint256 initialVotingDelay,
        uint256 initialVotingPeriod,
        uint256 initialProposalThreshold
    ) public initializer {
        _initialize(
            initialVotingDelay,
            initialVotingPeriod,
            initialProposalThreshold
        );
    }
}
