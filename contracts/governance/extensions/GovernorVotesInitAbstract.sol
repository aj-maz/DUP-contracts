// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./GovernorVotesCore.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @dev Extension of {Governor} for voting weight extraction from an {ERC20Votes} token, or since v4.5 an {ERC721Votes} token.
 *
 * _Available since v4.3._
 */
abstract contract GovernorVotesInitAbstract is GovernorVotesCore, Initializable {
    function _initialize(ILSP7Votes tokenAddress) internal onlyInitializing {
        token = tokenAddress;
    }
}
