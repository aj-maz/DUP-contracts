// SPDX-License-Identifier: MIT
//pragma solidity ^0.8.0;
//
//import {UniversalProfile} from "@lukso/lsp-smart-contracts/contracts/UniversalProfile.sol";
//import {LSP6KeyManager} from "@lukso/lsp-smart-contracts/contracts/LSP6KeyManager/LSP6KeyManager.sol";
//import {LSP1UniversalReceiverDelegateUP} from "@lukso/lsp-smart-contracts/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol";
//
//contract UniversalProfileMock {
//    UniversalProfile public account;
//    LSP6KeyManager public keyManager;
//    LSP1UniversalReceiverDelegateUP public universalReceiverDelegate;
//
//    constructor() {
//        account = new UniversalProfile(msg.sender);
//        keyManager = new LSP6KeyManager(address(account));
//        universalReceiverDelegate = new LSP1UniversalReceiverDelegateUP();
//    }
//}
//