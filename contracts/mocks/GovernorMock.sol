// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../governance/Governor.sol";
import "../governance/GovernorCore.sol";
import "../governance/extensions/GovernorSettings.sol";
import "../governance/extensions/GovernorSettingsCore.sol";
import "../governance/extensions/GovernorCountingSimple.sol";
import "../governance/extensions/GovernorVotesQuorumFraction.sol";
import "../governance/extensions/GovernorVotes.sol";
import "../LSP7Votes/ILSP7Votes.sol";

contract GovernorMock is
    GovernorSettings,
    GovernorVotesQuorumFraction,
    GovernorCountingSimple,
    Governor
{
    constructor(
        string memory name_,
        ILSP7Votes token_,
        uint256 votingDelay_,
        uint256 votingPeriod_,
        uint256 quorumNumerator_
    )
        Governor(name_)
        GovernorSettings(votingDelay_, votingPeriod_, 0)
        GovernorVotes(token_)
        GovernorVotesQuorumFraction(quorumNumerator_)
    {}

    function cancel(bytes[] memory calldatas, bytes32 salt)
        public
        returns (uint256 proposalId)
    {
        return _cancel(calldatas, salt);
    }

    function proposalThreshold()
        public
        view
        override(GovernorCore, GovernorSettingsCore)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function propose(bytes[] memory calldatas, string memory description)
        public
        virtual
        override(GovernorCore)
        returns (uint256)
    {
        return super.propose(calldatas, description);
    }
}
