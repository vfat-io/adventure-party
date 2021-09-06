import { expect } from "chai";
import { ethers } from "hardhat";
import { AdventureParty__factory, Rarity, RarityGold } from "../typechain"

describe("AdventureParty", function () {
  it("Should summon", async function () {
    const AdventureParty = <AdventureParty__factory> await ethers.getContractFactory("AdventureParty");
    const adventureParty = await AdventureParty.deploy();
    await adventureParty.deployed();
    await adventureParty.summonMany([1,2,3,4,5]);
    await adventureParty.adventureAll();

    const rarity = <Rarity>await ethers.getContractAt("Rarity", await adventureParty.rarity());
    const p0 = await adventureParty.adventurers(0);
    const xp0 = parseInt(ethers.utils.formatEther(await rarity.xp(p0)));
    expect(xp0).to.be.equal(250, "XP should be 250 after adventuring");
    
    await expect(adventureParty.adventureAll()).to.be.revertedWith("");

    await ethers.provider.send('evm_increaseTime', [24*60*60]);
    await adventureParty.adventureAll();
  });

  it("Should level up and claim gold", async function () {
    const AdventureParty = <AdventureParty__factory> await ethers.getContractFactory("AdventureParty");
    const adventureParty = await AdventureParty.deploy();
    await adventureParty.deployed();
    await adventureParty.summonMany([1,2,3,4,5]);
    await adventureParty.adventureAll();

    for (let i = 0; i < 3; i ++) {
      await ethers.provider.send('evm_increaseTime', [24*60*60 + 1]);
      await adventureParty.adventureAll();
    }

    await adventureParty.levelUpAll();

    const rarityGold = <RarityGold>await ethers.getContractAt("RarityGold", await adventureParty.rarityGold());

    console.log("Adventurer 0 balance ", 
      ethers.utils.formatEther(await rarityGold.balanceOf(await adventureParty.adventurers(0))));
  });

  it("Should transfer all from one party to another", async function () {
    const AdventureParty = <AdventureParty__factory> await ethers.getContractFactory("AdventureParty");
    const adventureParty = await AdventureParty.deploy();
    await adventureParty.deployed();
    await adventureParty.summonMany([1,2,3,4,5]);

    const adventureParty2 = await AdventureParty.deploy();
    await adventureParty2.deployed();
    await adventureParty.approveOtherParty(adventureParty2.address);
    await adventureParty2.transferAllFromOtherParty(adventureParty.address);
    await adventureParty.clearParty();

    console.log("Adventure Party 1 count", (await adventureParty.adventurerCount()).toNumber());
    console.log("Adventure Party 2 count", (await adventureParty2.adventurerCount()).toNumber());
  })
});