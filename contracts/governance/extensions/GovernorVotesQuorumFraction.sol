// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {GovernorVotesQuorumFractionCore} from "./GovernorVotesQuorumFractionCore.sol";

abstract contract GovernorVotesQuorumFraction is
    GovernorVotesQuorumFractionCore
{
    /**
     * @dev Initialize quorum as a fraction of the token's total supply.
     *
     * The fraction is specified as `numerator / denominator`. By default the denominator is 100, so quorum is
     * specified as a percent: a numerator of 10 corresponds to quorum being 10% of total supply. The denominator can be
     * customized by overriding {quorumDenominator}.
     */
    constructor(uint256 quorumNumeratorValue) {
        _updateQuorumNumerator(quorumNumeratorValue);
    }
}
