// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Rarity.sol";
import "./RarityGold.sol";
import "./Ownable.sol";

contract AdventureParty is Ownable {
    Rarity public rarity = Rarity(0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb);
    RarityGold public rarityGold = RarityGold(0x2069B76Afe6b734Fb65D1d099E7ec64ee9CC76B2);
    uint[] public adventurers;

    constructor(uint[] memory classes) {
        rarity.setApprovalForAll(msg.sender, true);
        for (uint i = 0; i < classes.length; i++) {
            adventurers.push(rarity.next_summoner());
            rarity.summon(classes[i]);
        }
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
}