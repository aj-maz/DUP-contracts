// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../governance/GovernorInitAbstract.sol";
import "../governance/GovernorCore.sol";
import "../governance/extensions/GovernorSettingsInitAbstract.sol";
import "../governance/extensions/GovernorSettingsCore.sol";
import "../governance/extensions/GovernorCountingSimple.sol";
import "../governance/extensions/GovernorVotesQuorumFractionInitAbstract.sol";
import "../governance/extensions/GovernorVotesInitAbstract.sol";
import "../LSP7Votes/ILSP7Votes.sol";

contract GovernorMockInit is
    GovernorSettingsInitAbstract,
    GovernorVotesQuorumFractionInitAbstract,
    GovernorVotesInitAbstract,
    GovernorCountingSimple,
    GovernorInitAbstract
{
    function initialize(
        address target_,
        address up_,
        string memory name_,
        ILSP7Votes token_,
        uint256 votingDelay_,
        uint256 votingPeriod_,
        uint256 quorumNumerator_
    ) public initializer {
        GovernorInitAbstract._initialize(target_, up_, name_);
        GovernorSettingsInitAbstract._initialize(
            votingDelay_,
            votingPeriod_,
            0
        );
        GovernorVotesInitAbstract._initialize(token_);
        GovernorVotesQuorumFractionInitAbstract._initialize(quorumNumerator_);
    }

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
