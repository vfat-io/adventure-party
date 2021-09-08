import {BigNumber} from "ethers";
import {ethers} from "hardhat";
import { AdventureParty, AdventureParty__factory, Rarity, Rarity__factory } from "../typechain";

const XP_PER_DAY = BigNumber.from(250).mul(BigNumber.from(10).pow(18));
const RARITY_CONTRACT = "0xce761d788df608bd21bdd59d6f4b54b2e27f25bb";

export async function displayStatus() {
    const [wallet] = await ethers.getSigners();
    const adventurePartyAddress = process.env.ADVENTURE_PARTY;
    if (adventurePartyAddress) {
        const adventureParty: AdventureParty = await AdventureParty__factory.connect(adventurePartyAddress, wallet);
        const rarity: Rarity = await Rarity__factory.connect(RARITY_CONTRACT, wallet);

        const adventurersCount = await adventureParty.adventurerCount();

        console.log("my Adventurers: ");

        for (let i = 0; i < adventurersCount.toNumber(); i++) {
            const id = await adventureParty.adventurerAt(i);

            const adventurer = await rarity.summoner(id);
            const xpRequired = await rarity.xp_required(adventurer._level);
            const className = await rarity.classes(adventurer._class);

            const nextLeveling = new Date(adventurer._log.toNumber() * 1000).toLocaleString()

            const nbAdventureToLevelUp = xpRequired.sub(adventurer._xp).div(XP_PER_DAY);
            console.log(`${className} (${id}): level: ${adventurer._level.toString()}, xp: ${formatValue(adventurer._xp)} (nb days to level up: ${nbAdventureToLevelUp.toString()}). Next leveling ${nextLeveling}`);
        }
    }
}

export async function runParty() {
    const [wallet] = await ethers.getSigners();

    const adventurePartyAddress = process.env.ADVENTURE_PARTY;

    if (adventurePartyAddress) {

        const adventureParty: AdventureParty = await AdventureParty__factory.connect(adventurePartyAddress, wallet);

        if (await canAdventure()) {
            let trx = await adventureParty.adventureAll();
            await trx.wait();
        }

        if (await canLevelUp()) {
            let trx = await adventureParty.levelUpAll();
            await trx.wait();
        }
    }
}

async function canAdventure() {
    const [wallet] = await ethers.getSigners();
    const adventurePartyAddress = process.env.ADVENTURE_PARTY;
    if (adventurePartyAddress) {
        const adventureParty: AdventureParty = await AdventureParty__factory.connect(adventurePartyAddress, wallet);
        const rarity: Rarity = await Rarity__factory.connect(RARITY_CONTRACT, wallet);

        const adventurersCount = await adventureParty.adventurerCount();

        for (let i = 0; i < adventurersCount.toNumber(); i++) {
            const id = await adventureParty.adventurerAt(i);
            const adventurer = await rarity.summoner(id);

            const log = adventurer._log.toNumber() * 1000;
            if (log <= (new Date().getTime()) ) {
                return true;
            }
        }
    }

    return false;
}

async function canLevelUp() {
    const [wallet] = await ethers.getSigners();
    const adventurePartyAddress = process.env.ADVENTURE_PARTY;
    if (adventurePartyAddress) {
        const adventureParty: AdventureParty = await AdventureParty__factory.connect(adventurePartyAddress, wallet);
        const rarity: Rarity = await Rarity__factory.connect(RARITY_CONTRACT, wallet);

        const adventurersCount = await adventureParty.adventurerCount();

        for (let i = 0; i < adventurersCount.toNumber(); i++) {
            const id = await adventureParty.adventurerAt(i);
            const adventurer = await rarity.summoner(id);

            const xpRequired = await rarity.xp_required(adventurer._level);

            if (adventurer._xp.gte(xpRequired)) {
                return true;
            }
        }
    }

    return false;
}

export function formatValue(value: BigNumber) {
    return ethers.utils.formatUnits(value.toString(), 18);
}
