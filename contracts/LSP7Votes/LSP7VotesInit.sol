// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// modules
import {LSP7VotesInitAbstract} from "./LSP7VotesInitAbstract.sol";

/**
 * @title LSP7DigitalAssetInit contract
 * @author Aj Maz
 * @dev Proxy Implementation of a LSP7Votes compliant contract.
 *
 * This implementation is agnostic to the way tokens are created.
 * A supply mechanism has to be added in a derived contract using {_mint}
 */
contract LSP7VotesInit is LSP7VotesInitAbstract {
    /**
     * @dev initialize (= lock) base implementation contract on deployment
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Sets the token-Metadata
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the the token-Metadata
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) public virtual initializer {
        LSP7VotesInitAbstract._initialize(name_, symbol_, newOwner_);
    }
}
