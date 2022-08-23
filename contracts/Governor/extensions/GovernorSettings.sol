// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {GovernorSettingsCore} from "./GovernorSettingsCore.sol";

abstract contract GovernorSettings is GovernorSettingsCore {
    /**
     * @dev Initialize the governance parameters.
     */
    constructor(
        uint256 initialVotingDelay,
        uint256 initialVotingPeriod,
        uint256 initialProposalThreshold
    ) {
        _setVotingDelay(initialVotingDelay);
        _setVotingPeriod(initialVotingPeriod);
        _setProposalThreshold(initialProposalThreshold);
    }
}
