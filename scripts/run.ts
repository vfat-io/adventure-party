import { runParty } from "./common";

async function main() {
    await runParty();
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
