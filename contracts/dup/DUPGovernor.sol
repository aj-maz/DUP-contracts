// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../governance/GovernorInitAbstract.sol";
import "../governance/GovernorCore.sol";
import "../governance/extensions/GovernorSettingsInitAbstract.sol";
import "../governance/extensions/GovernorSettingsCore.sol";
import "../governance/extensions/GovernorCountingSimple.sol";
import "../governance/extensions/GovernorVotesQuorumFractionInitAbstract.sol";
import "../governance/extensions/GovernorVotesInitAbstract.sol";
import "../governance/extensions/GovernorTimelockControlInitAbstract.sol";
import "../LSP7Votes/ILSP7Votes.sol";
import {TimelockControllerCore} from "../governance/TimelockControllerCore.sol";

contract DUPGovernor is
    GovernorSettingsInitAbstract,
    GovernorVotesQuorumFractionInitAbstract,
    GovernorVotesInitAbstract,
    GovernorCountingSimple,
    GovernorInitAbstract,
    GovernorTimelockControlInitAbstract
{
    function initialize(
        address target_,
        address up_,
        string memory name_,
        ILSP7Votes token_,
        uint256 votingDelay_,
        uint256 votingPeriod_,
        uint256 quorumNumerator_,
        TimelockControllerCore timelockController_
    ) public initializer {
        GovernorInitAbstract._initialize(target_, up_, name_);
        GovernorSettingsInitAbstract._initialize(
            votingDelay_,
            votingPeriod_,
            0
        );
        GovernorVotesInitAbstract._initialize(token_);
        GovernorVotesQuorumFractionInitAbstract._initialize(quorumNumerator_);
        GovernorTimelockControlInitAbstract._initialize(timelockController_);
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
        override(IGovernor, GovernorCore)
        returns (uint256)
    {
        return super.propose(calldatas, description);
    }

    function _cancel(bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        virtual
        override(GovernorCore, GovernorTimelockControlCore)
        returns (uint256)
    {
        return super._cancel(calldatas, descriptionHash);
    }

    function _execute(
        uint256 proposalId, /* proposalId */
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal virtual override(GovernorCore, GovernorTimelockControlCore) {
        super._execute(
            proposalId, /* proposalId */
            calldatas,
            descriptionHash
        );
    }

    function _executor()
        internal
        view
        virtual
        override(GovernorCore, GovernorTimelockControlCore)
        returns (address)
    {
        return super._executor();
    }

    function state(uint256 proposalId)
        public
        view
        virtual
        override(GovernorCore, GovernorTimelockControlCore)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(GovernorCore, GovernorTimelockControlCore)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
