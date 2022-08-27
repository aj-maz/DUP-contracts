// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import {ILSP6KeyManager} from "@lukso/lsp-smart-contracts/contracts/LSP6KeyManager/ILSP6KeyManager.sol";

/**
 * @dev Contract module which acts as a timelocked controller. When set as the
 * owner of an `Ownable` smart contract, it enforces a timelock on all
 * `onlyOwner` maintenance operations. This gives time for users of the
 * controlled contract to exit before a potentially dangerous maintenance
 * operation is applied.
 *
 * By default, this contract is self administered, meaning administration tasks
 * have to go through the timelock process. The proposer (resp executor) role
 * is in charge of proposing (resp executing) operations. A common use case is
 * to position this {TimelockController} as the owner of a smart contract, with
 * a multisig or a DAO as the sole proposer.
 *
 * _Available since v3.3._
 */
abstract contract TimelockControllerCore is AccessControl {
    bytes32 public constant TIMELOCK_ADMIN_ROLE =
        keccak256("TIMELOCK_ADMIN_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant CANCELLER_ROLE = keccak256("CANCELLER_ROLE");
    uint256 internal constant _DONE_TIMESTAMP = uint256(1);

    mapping(bytes32 => uint256) private _timestamps;
    uint256 internal _minDelay;

    address internal _target;

    /**
     * @dev Emitted when a call is scheduled as part of operation `id`.
     */
    event CallScheduled(
        bytes32 indexed id,
        uint256 indexed index,
        bytes data,
        bytes32 predecessor,
        uint256 delay
    );

    /**
     * @dev Emitted when a call is performed as part of operation `id`.
     */
    event CallExecuted(bytes32 indexed id, uint256 indexed index, bytes data);

    /**
     * @dev Emitted when operation `id` is cancelled.
     */
    event Cancelled(bytes32 indexed id);

    /**
     * @dev Emitted when the minimum delay for future operations is modified.
     */
    event MinDelayChange(uint256 oldDuration, uint256 newDuration);

    function setTarget(address target_) public {
        require(_target == address(0), "already setted.");
        _target = target_;
    }

    /**
     * @dev Modifier to make a function callable only by a certain role. In
     * addition to checking the sender's role, `address(0)` 's role is also
     * considered. Granting a role to `address(0)` is equivalent to enabling
     * this role for everyone.
     */
    modifier onlyRoleOrOpenRole(bytes32 role) {
        if (!hasRole(role, address(0))) {
            _checkRole(role, _msgSender());
        }
        _;
    }

    /**
     * @dev Contract might receive/hold ETH as part of the maintenance process.
     */
    receive() external payable {}

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns whether an id correspond to a registered operation. This
     * includes both Pending, Ready and Done operations.
     */
    function isOperation(bytes32 id)
        public
        view
        virtual
        returns (bool registered)
    {
        return getTimestamp(id) > 0;
    }

    /**
     * @dev Returns whether an operation is pending or not.
     */
    function isOperationPending(bytes32 id)
        public
        view
        virtual
        returns (bool pending)
    {
        return getTimestamp(id) > _DONE_TIMESTAMP;
    }

    /**
     * @dev Returns whether an operation is ready or not.
     */
    function isOperationReady(bytes32 id)
        public
        view
        virtual
        returns (bool ready)
    {
        uint256 timestamp = getTimestamp(id);
        return timestamp > _DONE_TIMESTAMP && timestamp <= block.timestamp;
    }

    /**
     * @dev Returns whether an operation is done or not.
     */
    function isOperationDone(bytes32 id)
        public
        view
        virtual
        returns (bool done)
    {
        return getTimestamp(id) == _DONE_TIMESTAMP;
    }

    /**
     * @dev Returns the timestamp at with an operation becomes ready (0 for
     * unset operations, 1 for done operations).
     */
    function getTimestamp(bytes32 id)
        public
        view
        virtual
        returns (uint256 timestamp)
    {
        return _timestamps[id];
    }

    /**
     * @dev Returns the minimum delay for an operation to become valid.
     *
     * This value can be changed by executing an operation that calls `updateDelay`.
     */
    function getMinDelay() public view virtual returns (uint256 duration) {
        return _minDelay;
    }

    /**
     * @dev Returns the identifier of an operation containing a single
     * transaction.
     */
    function hashOperation(
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt
    ) public pure virtual returns (bytes32 hash) {
        return keccak256(abi.encode(data, predecessor, salt));
    }

    /**
     * @dev Returns the identifier of an operation containing a batch of
     * transactions.
     */
    function hashOperationBatch(
        bytes[] calldata payloads,
        bytes32 predecessor,
        bytes32 salt
    ) public pure virtual returns (bytes32 hash) {
        return keccak256(abi.encode(payloads, predecessor, salt));
    }

    /**
     * @dev Schedule an operation containing a single transaction.
     *
     * Emits a {CallScheduled} event.
     *
     * Requirements:
     *
     * - the caller must have the 'proposer' role.
     */
    function schedule(
        bytes calldata data,
        bytes32 predecessor,
        bytes32 salt,
        uint256 delay
    ) public virtual onlyRole(PROPOSER_ROLE) {
        bytes32 id = hashOperation(data, predecessor, salt);
        _schedule(id, delay);
        emit CallScheduled(id, 0, data, predecessor, delay);
    }

    /**
     * @dev Schedule an operation containing a batch of transactions.
     *
     * Emits one {CallScheduled} event per transaction in the batch.
     *
     * Requirements:
     *
     * - the caller must have the 'proposer' role.
     */
    function scheduleBatch(
        bytes[] calldata payloads,
        bytes32 predecessor,
        bytes32 salt,
        uint256 delay
    ) public virtual onlyRole(PROPOSER_ROLE) {
        bytes32 id = hashOperationBatch(payloads, predecessor, salt);
        _schedule(id, delay);
        for (uint256 i = 0; i < payloads.length; ++i) {
            emit CallScheduled(id, i, payloads[i], predecessor, delay);
        }
    }

    /**
     * @dev Schedule an operation that is to becomes valid after a given delay.
     */
    function _schedule(bytes32 id, uint256 delay) private {
        require(
            !isOperation(id),
            "TimelockController: operation already scheduled"
        );
        require(
            delay >= getMinDelay(),
            "TimelockController: insufficient delay"
        );
        _timestamps[id] = block.timestamp + delay;
    }

    /**
     * @dev Cancel an operation.
     *
     * Requirements:
     *
     * - the caller must have the 'canceller' role.
     */
    function cancel(bytes32 id) public virtual onlyRole(CANCELLER_ROLE) {
        require(
            isOperationPending(id),
            "TimelockController: operation cannot be cancelled"
        );
        delete _timestamps[id];

        emit Cancelled(id);
    }

    /**
     * @dev Execute an (ready) operation containing a single transaction.
     *
     * Emits a {CallExecuted} event.
     *
     * Requirements:
     *
     * - the caller must have the 'executor' role.
     */
    // This function can reenter, but it doesn't pose a risk because _afterCall checks that the proposal is pending,
    // thus any modifications to the operation during reentrancy should be caught.
    // slither-disable-next-line reentrancy-eth
    function execute(
        bytes calldata payload,
        bytes32 predecessor,
        bytes32 salt
    ) public payable virtual onlyRoleOrOpenRole(EXECUTOR_ROLE) {
        bytes32 id = hashOperation(payload, predecessor, salt);

        _beforeCall(id, predecessor);
        _execute(payload);
        emit CallExecuted(id, 0, payload);
        _afterCall(id);
    }

    /**
     * @dev Execute an (ready) operation containing a batch of transactions.
     *
     * Emits one {CallExecuted} event per transaction in the batch.
     *
     * Requirements:
     *
     * - the caller must have the 'executor' role.
     */
    function executeBatch(
        bytes[] calldata payloads,
        bytes32 predecessor,
        bytes32 salt
    ) public payable virtual onlyRoleOrOpenRole(EXECUTOR_ROLE) {
        bytes32 id = hashOperationBatch(payloads, predecessor, salt);

        _beforeCall(id, predecessor);
        for (uint256 i = 0; i < payloads.length; ++i) {
            bytes calldata payload = payloads[i];
            _execute(payload);
            emit CallExecuted(id, i, payload);
        }
        _afterCall(id);
    }

    /**
     * @dev Execute an operation's call.
     */
    function _execute(bytes calldata data) internal virtual {
        ILSP6KeyManager(_target).execute(data);
    }

    /**
     * @dev Checks before execution of an operation's calls.
     */
    function _beforeCall(bytes32 id, bytes32 predecessor) private view {
        require(
            isOperationReady(id),
            "TimelockController: operation is not ready"
        );
        require(
            predecessor == bytes32(0) || isOperationDone(predecessor),
            "TimelockController: missing dependency"
        );
    }

    /**
     * @dev Checks after execution of an operation's calls.
     */
    function _afterCall(bytes32 id) private {
        require(
            isOperationReady(id),
            "TimelockController: operation is not ready"
        );
        _timestamps[id] = _DONE_TIMESTAMP;
    }

    /**
     * @dev Changes the minimum timelock duration for future operations.
     *
     * Emits a {MinDelayChange} event.
     *
     * Requirements:
     *
     * - the caller must be the timelock itself. This can only be achieved by scheduling and later executing
     * an operation where the timelock is the target and the data is the ABI-encoded call to this function.
     */
    function updateDelay(uint256 newDelay) external virtual {
        require(
            msg.sender == address(this),
            "TimelockController: caller must be timelock"
        );
        emit MinDelayChange(_minDelay, newDelay);
        _minDelay = newDelay;
    }
}
