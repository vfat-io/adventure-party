// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Rarity.sol";
import "./RarityGold.sol";
import "./Ownable.sol";
import "./EnumerableSet.sol";

contract AdventureParty is Ownable, IERC721Receiver {
    using EnumerableSet for EnumerableSet.UintSet;

    Rarity public rarity = Rarity(0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb);
    RarityGold public rarityGold = RarityGold(0x2069B76Afe6b734Fb65D1d099E7ec64ee9CC76B2);
    EnumerableSet.UintSet adventurers;

    constructor() {
        rarity.setApprovalForAll(msg.sender, true);
    }

    function adventurerCount() public view returns (uint) {
        return adventurers.length();
    }

    function adventurerAt(uint index) public view returns (uint) {
        return adventurers.at(index);
    }

    function summonMany(uint[] memory classes) external onlyOwner {
        for (uint i = 0; i < classes.length; i++) {
            uint summonerID = rarity.next_summoner();
            adventurers.add(summonerID);
            rarity.summon(classes[i]);
        }
    }

    function approveOtherParty(address otherParty) external onlyOwner {
        rarity.setApprovalForAll(otherParty, true);
    }

    function clearParty() external {
        require(msg.sender == owner() ||
            AdventureParty(msg.sender).owner() == owner(), "Only owner or owner party");
        for (uint i = 0; i < adventurers.length(); i++) {
            require(rarity.ownerOf(adventurers.at(0)) != address(this), 
                "Contract still has adventurers");
        }
        delete adventurers;
    }

    /// @dev Order of operations to transfer from party Old to party New:
    /// 1) Old.approveOtherParty(New)
    /// 2) New.transferAllFromOtherParty(Old)
    /// *** 
    /// Please note this does not work with the older version of this contract 
    /// that used an array instead of an EnumerableSet. For that version please transfer
    /// them all here manually and then call registerAdventurers()
    /// ***
    function transferAllFromOtherParty(AdventureParty otherParty) external onlyOwner {
        uint otherPartyCount = otherParty.adventurerCount();
        for (uint i = 0; i < otherPartyCount; i++) {
            uint adventurerID = otherParty.adventurerAt(i);
            IERC721(rarity).safeTransferFrom(address(otherParty), address(this), adventurerID);
            adventurers.add(adventurerID);
        }
        otherParty.clearParty();
    }

    function executeMany(uint[] memory summonerIDs, address target, string memory func) public onlyOwner {
        for (uint i = 0; i < summonerIDs.length; i++) {
            target.call(abi.encodeWithSignature(func, summonerIDs[i]));
        }
    }

    function executeAll(address target, string memory func) public onlyOwner {
        executeMany(adventurers.values(), target, func);
    }

    function adventureAll() external {
        executeAll(address(rarity), "adventure(uint256)");
    }

    function levelUpAndClaimGold(uint256 summonerID) public {
        rarity.level_up(summonerID);
        rarityGold.claim(summonerID);
    }

    function levelUpAll() external {
        executeAll(address(this), "levelUpAndClaimGold(uint256)");
    }

    /// @dev After transferring any summoners to this contract, call this function with their summoner IDs.
    function registerAdventurers(uint[] memory summonerIDs) external onlyOwner {
        for (uint i = 0; i < summonerIDs.length; i++) {
            if (rarity.ownerOf(summonerIDs[i]) == address(this)) {
                adventurers.add(summonerIDs[i]);
            }
        }
    }

    // @dev After transferring out any summoners from this contract, call this function with their summoner IDs.
    function unregisterAdventurers(uint[] memory summonerIDs) external onlyOwner {
        for (uint i = 0; i < summonerIDs.length; i++) {
            if (rarity.ownerOf(summonerIDs[i]) != address(this)) {
                adventurers.remove(summonerIDs[i]);
            }
        }
    }

    function onERC721Received(address, address, uint256, bytes calldata) 
            public override pure returns(bytes4) {
        return this.onERC721Received.selector;
    }
}