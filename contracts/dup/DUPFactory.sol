// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./DUPLSP7Votes.sol";
import "./DUPGovernor.sol";
import "./DUPTimelockController.sol";
import "hardhat/console.sol";

contract DUPFactory is Ownable {
    DUPLSP7Votes public dupLsp7VotesImpl;
    DUPGovernor public dupGovernorImpl;
    DUPTimelockController public dupTimelockImpl;

    using Counters for Counters.Counter;

    struct DAO {
        DUPLSP7Votes asset;
        DUPGovernor governor;
        DUPTimelockController timelockController;
        address keymanager;
        address up;
    }

    struct DAOInfo {
        DAO dao;
        uint256 proposalCount;
    }

    mapping(uint256 => DAO) public daos;
    Counters.Counter public daoCounts;

    constructor() {
        dupLsp7VotesImpl = new DUPLSP7Votes();
        dupGovernorImpl = new DUPGovernor();
        dupTimelockImpl = new DUPTimelockController();
    }

    function _newDao() internal returns (uint256 daoId) {
        daoId = daoCounts.current();
        daoCounts.increment();
    }

    function deployT(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 supply_
    ) public {
        uint256 daoId = _newDao();
        _deployToken(daoId, name_, symbol_, newOwner_, supply_);
    }

    function deployL() public {
        uint256 daoId = _newDao();
        _deployTimelockController(daoId);
    }

    function deployTL(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 supply_
    ) public {
        uint256 daoId = _newDao();
        _deployToken(daoId, name_, symbol_, newOwner_, supply_);
        _deployTimelockController(daoId);
    }

    function deployG() public {
        uint256 daoId = _newDao();
        _deployGovernor(daoId);
    }

    function deployTG(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 supply_
    ) public {
        uint256 daoId = _newDao();
        _deployToken(daoId, name_, symbol_, newOwner_, supply_);
        _deployGovernor(daoId);
    }

    function deployLG() public {
        uint256 daoId = _newDao();
        _deployTimelockController(daoId);
        _deployGovernor(daoId);
    }

    function deployTLG(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 supply_
    ) public {
        uint256 daoId = _newDao();
        _deployToken(daoId, name_, symbol_, newOwner_, supply_);
        _deployTimelockController(daoId);
        _deployGovernor(daoId);
    }

    function setup(
        uint256 daoId_,
        address keyManager_,
        address up_,
        string memory name_,
        uint256 votingDelay_,
        uint256 votingPeriod_,
        uint256 quorumNumerator_,
        uint256 minDelay_,
        address executor_,
        address deployedToken_,
        address deployedGovernor_,
        address deployedTimelockController_
    ) public {
        DAO storage dao = daos[daoId_];
        dao.up = up_;
        dao.keymanager = keyManager_;
        if (address(dao.asset) == address(0)) {
            require(deployedToken_ != address(0));
            dao.asset = DUPLSP7Votes(deployedToken_);
        }
        if (address(dao.governor) == address(0)) {
            require(deployedGovernor_ != address(0));
            dao.governor = DUPGovernor(payable(deployedGovernor_));
        } else {
            address tlc = address(dao.timelockController) == address(0)
                ? deployedTimelockController_
                : address(dao.timelockController);
            dao.governor.initialize(
                keyManager_,
                up_,
                name_,
                dao.asset,
                votingDelay_,
                votingPeriod_,
                quorumNumerator_,
                DUPTimelockController(payable(tlc))
            );
        }
        if (address(dao.timelockController) == address(0)) {
            require(deployedTimelockController_ != address(0));
            dao.timelockController = DUPTimelockController(
                payable(deployedTimelockController_)
            );
        } else {
            dao.timelockController.initialize(
                minDelay_,
                keyManager_,
                address(dao.governor),
                executor_
            );
        }
    }

    function getDaoInfo(uint256 daoId_) public view returns (DAOInfo memory) {
        DAO memory dao = daos[daoId_];
        return DAOInfo(dao, dao.governor.getProposalsCount());
    }

    function getDaos() public view returns (DAO[] memory) {
        DAO[] memory daosList = new DAO[](daoCounts.current());
        for (uint256 i = 0; i < daosList.length; i++) {
            daosList[i] = daos[i];
        }
        return daosList;
    }

    function getDaosInfo() public view returns (DAOInfo[] memory) {
        DAOInfo[] memory daosList = new DAOInfo[](daoCounts.current());
        for (uint256 i = 0; i < daosList.length; i++) {
            daosList[i] = getDaoInfo(i);
        }
        return daosList;
    }

    function _deployToken(
        uint256 daoId_,
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 supply_
    ) internal {
        DAO storage dao = daos[daoId_];
        address token = Clones.clone(address(dupLsp7VotesImpl));
        DUPLSP7Votes(token).initialize(name_, symbol_, newOwner_, supply_);
        dao.asset = DUPLSP7Votes(payable(token));
        emit TokenDeployed(daoId_, address(token));
    }

    function _deployGovernor(uint256 daoId_) internal {
        DAO storage dao = daos[daoId_];
        address governor = Clones.clone(address(dupGovernorImpl));
        dao.governor = DUPGovernor(payable(governor));
        emit GovernorDeployed(daoId_, address(governor));
    }

    function _deployTimelockController(uint256 daoId_) internal {
        DAO storage dao = daos[daoId_];
        address timelockController = Clones.clone(address(dupTimelockImpl));
        dao.timelockController = DUPTimelockController(
            payable(timelockController)
        );
        emit TimelockControllerDeployed(daoId_, address(timelockController));
    }

    event TokenDeployed(uint256 indexed daoId, address tokenAddress);
    event GovernorDeployed(uint256 indexed daoId, address governorAddress);
    event TimelockControllerDeployed(
        uint256 indexed daoId,
        address timelockControllerAddress
    );
}
