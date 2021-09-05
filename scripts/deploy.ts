import { ethers } from "hardhat";
import { AdventureParty__factory } from "../typechain"
import * as constructor_params from "../constructor_params"

async function main() {
  const AdventureParty = <AdventureParty__factory> await ethers.getContractFactory("AdventureParty");
  const adventureParty = await AdventureParty.deploy(constructor_params[0]);

  await adventureParty.deployed();

  console.log("AdventureParty deployed to:", adventureParty.address);
  const lastClass = await adventureParty.adventurers(constructor_params[0].length - 1)
  console.log(`Adventurer number ${constructor_params[0].length}'s summoner ID is ${lastClass}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
