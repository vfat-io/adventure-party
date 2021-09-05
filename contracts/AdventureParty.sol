// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./rarity.sol";
import "./Ownable.sol";

contract AdventureParty is Ownable {
    rarity public Rarity = rarity(0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb);
    uint[] public adventurers;

    constructor(uint[] memory classes) {
        Rarity.setApprovalForAll(msg.sender, true);
        for (uint i = 0; i < classes.length; i++) {
            adventurers.push(Rarity.next_summoner());
            Rarity.summon(classes[i]);
        }
    }

    function adventureAll() external {
        for (uint i = 0; i < adventurers.length; i++) {
            Rarity.adventure(adventurers[i]);
        }
    }

    function levelUpAll() external {
        for (uint i = 0; i < adventurers.length; i++) {
            Rarity.level_up(adventurers[i]);
        }
    }
}