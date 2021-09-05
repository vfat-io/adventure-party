import { expect } from "chai";
import { ethers } from "hardhat";
import { AdventureParty__factory, Rarity } from "../typechain"

describe("AdventurePaty", function () {
  it("Should summon and level up", async function () {
    const AdventureParty = <AdventureParty__factory> await ethers.getContractFactory("AdventureParty");
    const adventureParty = await AdventureParty.deploy([1,2,3,4,5]);
    await adventureParty.deployed();

    const p0 = await adventureParty.adventurers(0);

    await adventureParty.adventureAll();

    const rarity = <Rarity>await ethers.getContractAt("rarity", await adventureParty.Rarity());

    const xp0 = parseInt(ethers.utils.formatEther(await rarity.xp(p0)));

    expect(xp0).to.be.equal(250, "XP should be 250 after adventuring");
    
    await expect(adventureParty.adventureAll()).to.be.revertedWith("");

    await ethers.provider.send('evm_increaseTime', [24*60*60]);
    await adventureParty.adventureAll();
  });
});
