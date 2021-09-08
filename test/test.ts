import { expect } from "chai";
import { ethers } from "hardhat";
import { AdventureParty__factory, Rarity, RarityGold } from "../typechain"

describe("AdventureParty", function () {
  it("Should summon", async () => {
    const AdventureParty = <AdventureParty__factory> await ethers.getContractFactory("AdventureParty");
    const adventureParty = await AdventureParty.deploy();
    await adventureParty.deployed();
    await adventureParty.summonMany([1,2,3,4,5]);
    await adventureParty.adventureAll();

    const rarity = <Rarity>await ethers.getContractAt("Rarity", await adventureParty.rarity());
    const p0 = await adventureParty.adventurerAt(0);
    const xp0 = parseInt(ethers.utils.formatEther(await rarity.xp(p0)));
    expect(xp0).to.be.equal(250, "XP should be 250 after adventuring");
    
    await adventureParty.adventureAll();
    const xp1 = parseInt(ethers.utils.formatEther(await rarity.xp(p0)));
    expect(xp1).to.be.equal(250, "XP should be 250 after adventuring twice in a row");

    await ethers.provider.send('evm_increaseTime', [24*60*60 + 1000]);
    await adventureParty.adventureAll();
    const xp2 = parseInt(ethers.utils.formatEther(await rarity.xp(p0)));
    expect(xp2).to.be.equal(500, "XP should be 500 after adventuring for two days");
  });

  it("Should level up and claim gold", async () => {
    const AdventureParty = <AdventureParty__factory> await ethers.getContractFactory("AdventureParty");
    const adventureParty = await AdventureParty.deploy();
    const rarity = <Rarity>await ethers.getContractAt("Rarity", await adventureParty.rarity());
    await adventureParty.deployed();
    await adventureParty.summonMany([1,2,3,4,5]);
    await adventureParty.adventureAll();

    for (let i = 0; i < 3; i ++) {
      await ethers.provider.send('evm_increaseTime', [24*60*60 + 1000]);
      await adventureParty.adventureAll();
    }

    await adventureParty.levelUpAll();

    const rarityGold = <RarityGold>await ethers.getContractAt("RarityGold", await adventureParty.rarityGold());

    const p0 = await adventureParty.adventurerAt(0);
    console.log("Adventurer 0 balance ", ethers.utils.formatEther(await rarityGold.balanceOf(p0)));
    console.log("Adventurer 0 level", (await rarity.level(p0)).toNumber());
    console.log("Adventurer 0 XP ", ethers.utils.formatEther(await rarity.xp(p0)));
  });

  it("Should transfer all from one party to another", async () => {
    const AdventureParty = <AdventureParty__factory> await ethers.getContractFactory("AdventureParty");
    const adventureParty = await AdventureParty.deploy();
    await adventureParty.deployed();
    await adventureParty.summonMany([1,2,3,4,5]);

    const adventureParty2 = await AdventureParty.deploy();
    await adventureParty2.deployed();
    await adventureParty.approveOtherParty(adventureParty2.address);
    await adventureParty2.transferAllFromOtherParty(adventureParty.address);

    console.log("Adventure Party 1 count", (await adventureParty.adventurerCount()).toNumber());
    console.log("Adventure Party 2 count", (await adventureParty2.adventurerCount()).toNumber());
  });

  it("Should summon on wallet, transfer into party, register on party, and adventure", async () => {
    const AdventureParty = <AdventureParty__factory> await ethers.getContractFactory("AdventureParty");
    const adventureParty = await AdventureParty.deploy();
    await adventureParty.deployed();
    const rarity = <Rarity>await ethers.getContractAt("Rarity", await adventureParty.rarity());
    const nextSummoner = await rarity.next_summoner();
    await rarity.summon(1);
    await rarity.transferFrom(await adventureParty.owner(), adventureParty.address, nextSummoner);
    await adventureParty.registerAdventurers([nextSummoner]);
    expect((await adventureParty.adventurerCount()).toNumber()).to.equal(1);
    await adventureParty.adventureAll();
    const xp = parseInt(ethers.utils.formatEther(await rarity.xp(nextSummoner)));
    expect(xp).to.be.equal(250, "XP should be 250 after adventuring");
  })
});