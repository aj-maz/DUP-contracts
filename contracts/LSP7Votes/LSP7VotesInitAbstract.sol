// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// modules
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {LSP7DigitalAssetInitAbstract} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/LSP7DigitalAssetInitAbstract.sol";
import {LSP7DigitalAssetCore} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/LSP7DigitalAssetCore.sol";
import {LSP7VotesCore} from "./LSP7VotesCore.sol";

// constants
import {_INTERFACEID_LSP7VOTES} from "./LSP7VotesConstants.sol";

/**
 * @title LSP7VotesInitAbstract contract
 * @author Aj Maz
 * @dev Proxy Implementation of a LSP7Votes compliant contract.
 */
abstract contract LSP7VotesInitAbstract is
    LSP7VotesCore,
    LSP7DigitalAssetInitAbstract
{
    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) internal virtual override onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            false
        );
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, LSP7DigitalAssetInitAbstract)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_LSP7VOTES ||
            super.supportsInterface(interfaceId);
    }

    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override(LSP7VotesCore, LSP7DigitalAssetCore) {
        super._mint(to, amount, force, data);
    }

    function _burn(
        address account,
        uint256 amount,
        bytes memory data
    ) internal virtual override(LSP7VotesCore, LSP7DigitalAssetCore) {
        super._burn(account, amount, data);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override(LSP7VotesCore, LSP7DigitalAssetCore) {
        super._transfer(from, to, amount, force, data);
    }
}
