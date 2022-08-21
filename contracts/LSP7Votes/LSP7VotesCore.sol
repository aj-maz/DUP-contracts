// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {ERC165Checker} from "@lukso/lsp-smart-contracts/contracts/Custom/ERC165Checker.sol";

import {LSP7DigitalAssetCore} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/LSP7DigitalAssetCore.sol";
import {ILSP7Votes} from "./ILSP7Votes.sol";
import {ILSP1UniversalReceiver} from "@lukso/lsp-smart-contracts/contracts/LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";

import {_INTERFACEID_LSP1} from "@lukso/lsp-smart-contracts/contracts/LSP1UniversalReceiver/LSP1Constants.sol";
import {_TYPEID_LSP7_VOTES_TOKENSDELEGATEE, _TYPEID_LSP7_VOTES_TOKENSDELEGATOR} from "./LSP7VotesConstants.sol";

/**
 * @dev Extension of LSP7 to support Compound-like voting and delegation. This version is based on OpenZepplin ,
 * ERC20Votes and supports token supply up to 2^224^ - 1, while COMP is limited to 2^96^ - 1.
 *
 *
 * This extension keeps a history (checkpoints) of each account's vote power. Vote power can be delegated either
 * by calling the {delegate} function directly. Voting
 * power can be queried through the public accessors {getVotes} and {getPastVotes}.
 *
 * Since in lukso most of the of interactions are using a keymanager and Universal Profile
 * I removed delegateBySig and related functions, this will reduce the complexity and potential bugs
 * and also will improve the developer experience.
 * For a seamless user experience  we can still manage to get a similar gasless experience thanks
 * to transaction relayer architecture.
 *
 * Also for delegation added two {_notifyDelegator} and {_notifyDelegator} functions to notify delegator and delegatee using
 * LSP1 Universal Receiver
 *
 * By default, token balance does not account for voting power. This makes transfers cheaper. The downside is that it
 * requires users to delegate to themselves in order to activate checkpoints and have their voting power tracked.
 *
 */
abstract contract LSP7VotesCore is ILSP7Votes, LSP7DigitalAssetCore {
    struct Checkpoint {
        uint32 fromBlock;
        uint224 votes;
    }

    mapping(address => address) private _delegates;
    mapping(address => Checkpoint[]) private _checkpoints;
    Checkpoint[] private _totalSupplyCheckpoints;

    /**
     * @dev Get the `pos`-th checkpoint for `account`.
     */
    function checkpoints(address account, uint32 pos)
        public
        view
        virtual
        returns (Checkpoint memory)
    {
        return _checkpoints[account][pos];
    }

    /**
     * @dev Get number of checkpoints for `account`.
     */
    function numCheckpoints(address account)
        public
        view
        virtual
        returns (uint32)
    {
        return SafeCast.toUint32(_checkpoints[account].length);
    }

    /**
     * @dev Get the address `account` is currently delegating to.
     */
    function delegates(address account)
        public
        view
        virtual
        override
        returns (address)
    {
        return _delegates[account];
    }

    /**
     * @dev Gets the current votes balance for `account`
     */
    function getVotes(address account)
        public
        view
        virtual
        override
        returns (uint256)
    {
        uint256 pos = _checkpoints[account].length;
        return pos == 0 ? 0 : _checkpoints[account][pos - 1].votes;
    }

    /**
     * @dev Retrieve the number of votes for `account` at the end of `blockNumber`.
     *
     * Requirements:
     *
     * - `blockNumber` must have been already mined
     */
    function getPastVotes(address account, uint256 blockNumber)
        public
        view
        virtual
        override
        returns (uint256)
    {
        require(blockNumber < block.number, "LSP7Votes: block not yet mined");
        return _checkpointsLookup(_checkpoints[account], blockNumber);
    }

    /**
     * @dev Retrieve the `totalSupply` at the end of `blockNumber`. Note, this value is the sum of all balances.
     * It is but NOT the sum of all the delegated votes!
     *
     * Requirements:
     *
     * - `blockNumber` must have been already mined
     */
    function getPastTotalSupply(uint256 blockNumber)
        public
        view
        virtual
        override
        returns (uint256)
    {
        require(blockNumber < block.number, "LSP7Votes: block not yet mined");
        return _checkpointsLookup(_totalSupplyCheckpoints, blockNumber);
    }

    /**
     * @dev Lookup a value in a list of (sorted) checkpoints.
     */
    function _checkpointsLookup(Checkpoint[] storage ckpts, uint256 blockNumber)
        private
        view
        returns (uint256)
    {
        // We run a binary search to look for the earliest checkpoint taken after `blockNumber`.
        //
        // During the loop, the index of the wanted checkpoint remains in the range [low-1, high).
        // With each iteration, either `low` or `high` is moved towards the middle of the range to maintain the invariant.
        // - If the middle checkpoint is after `blockNumber`, we look in [low, mid)
        // - If the middle checkpoint is before or equal to `blockNumber`, we look in [mid+1, high)
        // Once we reach a single value (when low == high), we've found the right checkpoint at the index high-1, if not
        // out of bounds (in which case we're looking too far in the past and the result is 0).
        // Note that if the latest checkpoint available is exactly for `blockNumber`, we end up with an index that is
        // past the end of the array, so we technically don't find a checkpoint after `blockNumber`, but it works out
        // the same.
        uint256 high = ckpts.length;
        uint256 low = 0;
        while (low < high) {
            uint256 mid = Math.average(low, high);
            if (ckpts[mid].fromBlock > blockNumber) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        return high == 0 ? 0 : ckpts[high - 1].votes;
    }

    /**
     * @dev Delegate votes from the sender to `delegatee`.
     */
    function delegate(address delegatee) public virtual override {
        _delegate(_msgSender(), delegatee);
    }

    /**
     * @dev Maximum token supply. Defaults to `type(uint224).max` (2^224^ - 1).
     */
    function _maxSupply() internal view virtual returns (uint224) {
        return type(uint224).max;
    }

    /**
     * @dev Snapshots the totalSupply after it has been increased.
     */
    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        super._mint(to, amount, force, data);
        require(
            totalSupply() <= _maxSupply(),
            "ERC20Votes: total supply risks overflowing votes"
        );

        _writeCheckpoint(_totalSupplyCheckpoints, _add, amount);
    }

    /**
     * @dev Snapshots the totalSupply after it has been decreased.
     */
    function _burn(
        address account,
        uint256 amount,
        bytes memory data
    ) internal virtual override {
        super._burn(account, amount, data);
        _writeCheckpoint(_totalSupplyCheckpoints, _subtract, amount);
    }

    /**
     * @dev Move voting power when tokens are transferred.
     *
     * Emits a {DelegateVotesChanged} event.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        super._transfer(from, to, amount, force, data);

        _moveVotingPower(delegates(from), delegates(to), amount);
    }

    /**
     * @dev Change delegation for `delegator` to `delegatee`.
     *
     * Emits events {DelegateChanged} and {DelegateVotesChanged}.
     */
    function _delegate(address delegator, address delegatee) internal virtual {
        address currentDelegate = delegates(delegator);
        uint256 delegatorBalance = balanceOf(delegator);
        _delegates[delegator] = delegatee;

        emit DelegateChanged(delegator, currentDelegate, delegatee);

        _moveVotingPower(currentDelegate, delegatee, delegatorBalance);

        _notifyDelegator(delegator, delegatee, delegatorBalance);
        _notifyDelegatee(delegator, delegatee, delegatorBalance);
    }

    function _moveVotingPower(
        address src,
        address dst,
        uint256 amount
    ) private {
        if (src != dst && amount > 0) {
            if (src != address(0)) {
                (uint256 oldWeight, uint256 newWeight) = _writeCheckpoint(
                    _checkpoints[src],
                    _subtract,
                    amount
                );
                emit DelegateVotesChanged(src, oldWeight, newWeight);
            }

            if (dst != address(0)) {
                (uint256 oldWeight, uint256 newWeight) = _writeCheckpoint(
                    _checkpoints[dst],
                    _add,
                    amount
                );
                emit DelegateVotesChanged(dst, oldWeight, newWeight);
            }
        }
    }

    function _writeCheckpoint(
        Checkpoint[] storage ckpts,
        function(uint256, uint256) view returns (uint256) op,
        uint256 delta
    ) private returns (uint256 oldWeight, uint256 newWeight) {
        uint256 pos = ckpts.length;
        oldWeight = pos == 0 ? 0 : ckpts[pos - 1].votes;
        newWeight = op(oldWeight, delta);

        if (pos > 0 && ckpts[pos - 1].fromBlock == block.number) {
            ckpts[pos - 1].votes = SafeCast.toUint224(newWeight);
        } else {
            ckpts.push(
                Checkpoint({
                    fromBlock: SafeCast.toUint32(block.number),
                    votes: SafeCast.toUint224(newWeight)
                })
            );
        }
    }

    function _add(uint256 a, uint256 b) private pure returns (uint256) {
        return a + b;
    }

    function _subtract(uint256 a, uint256 b) private pure returns (uint256) {
        return a - b;
    }

    /**
     * @dev An attempt is made to notify the delegator about the `amount` tokens changing delegation using
     * LSP1 interface.
     */
    function _notifyDelegator(
        address delegator,
        address delegatee,
        uint256 amount
    ) internal virtual {
        if (
            ERC165Checker.supportsERC165Interface(delegator, _INTERFACEID_LSP1)
        ) {
            bytes memory packedData = abi.encodePacked(
                delegator,
                delegatee,
                amount
            );
            ILSP1UniversalReceiver(delegator).universalReceiver(
                _TYPEID_LSP7_VOTES_TOKENSDELEGATOR,
                packedData
            );
        }
    }

    /**
     * @dev An attempt is made to notify the delegator about the `amount` tokens changing delegator using
     * LSP1 interface.
     */
    function _notifyDelegatee(
        address delegator,
        address delegatee,
        uint256 amount
    ) internal virtual {
        if (
            ERC165Checker.supportsERC165Interface(delegatee, _INTERFACEID_LSP1)
        ) {
            bytes memory packedData = abi.encodePacked(
                delegator,
                delegatee,
                amount
            );
            ILSP1UniversalReceiver(delegatee).universalReceiver(
                _TYPEID_LSP7_VOTES_TOKENSDELEGATEE,
                packedData
            );
        }
    }
}
