# Adventure Party

Summon/adventure multiple adventures at once!

Deploy instructions:
```
npm i
cp .env.template .env
# Edit .env
npm run compile
npm run test
# !!! Edit scripts/deploy.ts file to choose which class IDs you want !!! The default is one of each class.
# Test the deploy tx
npx hardhat run scripts/deploy.ts
# Actually deploy
npx hardhat run --network fantom scripts/deploy.ts
```

once deployed make sure to copy the created contract address in `.env` variable `ADVENTURE_PARTY`

Afterwards navigate to your deployed contract on ftmscan and use adventureAll() to adventure your entire party!

or 

You can run party using `npm run run-party`
You can display adventurers stats using `npm run display-status`

## Schedule adventures

you can schedule parties to run on predefined schedule using `nohup npm run schdule-party &`

The schedule is controlled using `CRON` config through `.env` file. By default it'll try run party
every 30min (it'll trigger transactions only when needed)
