// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Rarity.sol";
import "./RarityGold.sol";
import "./Ownable.sol";

contract AdventureParty is Ownable, IERC721Receiver {
    Rarity public rarity = Rarity(0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb);
    RarityGold public rarityGold = RarityGold(0x2069B76Afe6b734Fb65D1d099E7ec64ee9CC76B2);
    uint[] public adventurers;
    uint public adventurerCount;

    constructor() {
        rarity.setApprovalForAll(msg.sender, true);
    }

    function summonMany(uint[] memory classes) external onlyOwner {
        for (uint i = 0; i < classes.length; i++) {
            adventurers.push(rarity.next_summoner());
            rarity.summon(classes[i]);
            adventurerCount++;
        }
    }

    function approveOtherParty(address otherParty) external onlyOwner {
        rarity.setApprovalForAll(otherParty, true);
    }

    function clearParty() external {
        require(msg.sender == owner() ||
            AdventureParty(msg.sender).owner() == owner(), "Only owner or owner party");
        delete adventurers;
        adventurerCount = 0;
    }

    /// @dev Order of operations to transfer from party Old to party New:
    /// 1) Old.approveOtherParty(New)
    /// 2) New.transferAllFromOtherParty(Old)
    function transferAllFromOtherParty(AdventureParty otherParty) external onlyOwner {
        uint otherPartyCount = otherParty.adventurerCount();
        for (uint i = 0; i < otherPartyCount; i++) {
            uint adventurerID = otherParty.adventurers(i);
            IERC721(rarity).safeTransferFrom(address(otherParty), address(this), adventurerID);
            adventurers.push(adventurerID);
            adventurerCount++;
        }
        otherParty.clearParty();
    }

    function adventureAll() external {
        for (uint i = 0; i < adventurers.length; i++) {
            rarity.adventure(adventurers[i]);
        }
    }

    function levelUpAll() external {
        for (uint i = 0; i < adventurers.length; i++) {
            rarity.level_up(adventurers[i]);
            rarityGold.claim(adventurers[i]);
        }
    }

    bytes4 constant ERC721_RECEIVED = 0x150b7a02;

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata _data) 
    public override pure returns(bytes4) {
        return this.onERC721Received.selector;
    }
}