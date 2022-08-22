// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP7VOTES = 0xD680B28B;

bytes32 constant _TYPEID_LSP7_VOTES_TOKENSDELEGATOR = keccak256(
    "LSP7VotesTokensDelegator"
);

bytes32 constant _TYPEID_LSP7_VOTES_TOKENSDELEGATEE = keccak256(
    "LSP7VotesTokensDelegatee"
);
