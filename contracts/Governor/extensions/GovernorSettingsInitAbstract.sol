// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {GovernorSettingsCore} from "./GovernorSettingsCore.sol";

abstract contract GovernorSettingsInitAbstract is GovernorSettingsCore {
    function _initialize(
        uint256 initialVotingDelay,
        uint256 initialVotingPeriod,
        uint256 initialProposalThreshold
    ) internal virtual {
        _setVotingDelay(initialVotingDelay);
        _setVotingPeriod(initialVotingPeriod);
        _setProposalThreshold(initialProposalThreshold);
    }
}
