import { ethers } from "hardhat";
import { AdventureParty__factory } from "../typechain"


const CLASSES_TO_SUMMON = [1,2,3,4,5,6,7,8,9,10,11]


async function main() {
  const AdventureParty = <AdventureParty__factory> await ethers.getContractFactory("AdventureParty");
  const adventureParty = await AdventureParty.deploy();

  await adventureParty.deployed();
  await adventureParty.summonMany(CLASSES_TO_SUMMON);

  console.log("AdventureParty deployed to:", adventureParty.address);
  const lastClass = await adventureParty.adventurers(CLASSES_TO_SUMMON.length - 1)
  console.log(`Adventurer number ${CLASSES_TO_SUMMON.length}'s summoner ID is ${lastClass}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
