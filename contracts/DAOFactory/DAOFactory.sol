// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract DAOFactory {
    function create() public {
        // _createUniversalProfileForDao
        // _createGovernanceToken
        // _linkTokenToUP
        // _createTimelockController
        // _createVault
        // _linkVaultToUp
        // _createGovernor
        // _linkGovernorToUp
        // _createKeyManager
        // _linkKeyManagerToUp
        // _setupKeyManagerPermissions
    }

    function createWithCustomToken() public {
        // _createUniversalProfileForDao
        // _linkTokenToUP
        // _createTimelockController
        // _createVault
        // _linkVaultToUp
        // _createGovernor
        // _linkGovernorToUp
        // _createKeyManager
        // _linkKeyManagerToUp
        // _setupKeyManagerPermissions
    }

    function createWithCustomGovernor() public {
        // _createUniversalProfileForDao
        // _linkTokenToUP
        // _createVault
        // _linkVaultToUp
        // _linkGovernorToUp
        // _createKeyManager
        // _linkKeyManagerToUp
        // _setupKeyManagerPermissions
    }

    function linkTokenToUP() public {}

    function linkGovernorToUp() public {}

    function linkKeyManagerToUp() public {}

    function setupKeyManagerPermissions() public {}

    function _createUniversalProfileForDao() internal {}

    function _createGovernanceToken() internal {}

    function _linkTokenToUP() internal {}

    function _createTimelockController() internal {}

    function _createVault() internal {}

    function _linkVaultToUp() internal {}

    function _createGovernor() internal {}

    function _linkGovernorToUp() internal {}

    function _createKeyManager() internal {}

    function _linkKeyManagerToUp() internal {}

    function _setupKeyManagerPermissions() internal {}
}
