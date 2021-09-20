import {BigNumber, utils} from "ethers";
import {ethers} from "hardhat";
import { AdventureParty, Rarity, RarityGold } from "../typechain";

const XP_PER_DAY = BigNumber.from(250).mul(BigNumber.from(10).pow(18));
const RARITY_CONTRACT = "0xce761d788df608bd21bdd59d6f4b54b2e27f25bb";
const RARITY_GOLD_CONTRACT = "0x2069B76Afe6b734Fb65D1d099E7ec64ee9CC76B2";

interface CharacterStats {
    'Class': string;
    ID: string;
    Level: string;
    Gold: string;
    XP: string;
    'Days to Next Level': string;
    'Next Adventure Time': string;
}

export async function displayStatus() {
    const [wallet] = await ethers.getSigners();
    const adventurePartyAddress = process.env.ADVENTURE_PARTY;
    if (adventurePartyAddress) {
        const adventureParty = <AdventureParty> await ethers.getContractAt("AdventureParty", adventurePartyAddress);
        const rarity = <Rarity> await ethers.getContractAt("Rarity", RARITY_CONTRACT);
        const gold = <RarityGold> await ethers.getContractAt("RarityGold", RARITY_GOLD_CONTRACT);

        const adventurersCount = await adventureParty.connect(wallet).adventurerCount();

        const myCharacters: CharacterStats[] = [];
        for (let i = 0; i < adventurersCount.toNumber(); i++) {
            const id = await adventureParty.connect(wallet).adventurerAt(i);

            const adventurer = await rarity.connect(wallet).summoner(id);
            const xpRequired = await rarity.connect(wallet).xp_required(adventurer._level);
            const className = await rarity.connect(wallet).classes(adventurer._class);

            const nextLeveling = new Date(adventurer._log.toNumber() * 1000).toLocaleString()

            const nbAdventureToLevelUp = xpRequired.sub(adventurer._xp).div(XP_PER_DAY);
            const adventurerGold = utils.formatUnits(await gold.balanceOf(id), 18)
            
            myCharacters.push({
                'Class': className,
                ID: id.toString(),
                Level: adventurer._level.toString(),
                Gold: adventurerGold,
                XP: formatValue(adventurer._xp),
                'Days to Next Level': nbAdventureToLevelUp.toString(),
                'Next Adventure Time': nextLeveling,
            });
            console.clear();
            console.log("My Adventurers: ");
            console.table(myCharacters);
            console.log(
                i == adventurersCount.toNumber() - 1 ? "Done." : "Loading ..."
            );
        }
    }
}

export async function runParty() {
    const [wallet] = await ethers.getSigners();

    const adventurePartyAddress = process.env.ADVENTURE_PARTY;

    if (adventurePartyAddress) {

        const adventureParty = <AdventureParty> await ethers.getContractAt("AdventureParty", adventurePartyAddress);

        if (await canAdventure()) {
            console.info("Running Adventure...");
            let trx = await adventureParty.connect(wallet).adventureAll();
            await trx.wait();
        }

        if (await canLevelUp()) {
            console.info("Leveling up...");
            let trx = await adventureParty.connect(wallet).levelUpAll();
            await trx.wait();
        }
    }
}

async function canAdventure() {
    const [wallet] = await ethers.getSigners();
    const adventurePartyAddress = process.env.ADVENTURE_PARTY;
    if (adventurePartyAddress) {
        const adventureParty = <AdventureParty> await ethers.getContractAt("AdventureParty", adventurePartyAddress);
        const rarity = <Rarity> await ethers.getContractAt("Rarity", RARITY_CONTRACT);

        const adventurersCount = await adventureParty.connect(wallet).adventurerCount();

        for (let i = 0; i < adventurersCount.toNumber(); i++) {
            const id = await adventureParty.connect(wallet).adventurerAt(i);
            const adventurer = await rarity.connect(wallet).summoner(id);

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
        const adventureParty = <AdventureParty> await ethers.getContractAt("AdventureParty", adventurePartyAddress);
        const rarity = <Rarity> await ethers.getContractAt("Rarity", RARITY_CONTRACT);

        const adventurersCount = await adventureParty.connect(wallet).adventurerCount();

        for (let i = 0; i < adventurersCount.toNumber(); i++) {
            const id = await adventureParty.connect(wallet).adventurerAt(i);
            const adventurer = await rarity.connect(wallet).summoner(id);

            const xpRequired = await rarity.connect(wallet).xp_required(adventurer._level);

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
