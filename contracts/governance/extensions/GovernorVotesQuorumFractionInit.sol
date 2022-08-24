// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {GovernorVotesQuorumFractionInitAbstract} from "./GovernorVotesQuorumFractionInitAbstract.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract GovernorSettingsInit is
    GovernorVotesQuorumFractionInitAbstract,
    Initializable
{
    function initialize(uint256 quorumNumeratorValue) public initializer {
        _initialize(quorumNumeratorValue);
    }
}
