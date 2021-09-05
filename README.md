# Adventure Party

Summon/adventure multiple adventures at once!

Deploy instructions:
```
npm i
cp .env.template .env
# Edit .env
npx hardhat compile
npx hardhat test
# !!! Edit constructor_params.js file to choose which class IDs you want !!! The default is one of each class.
# Test the deploy tx
npx hardhat deploy 
# Actually deploy
npx hardhat deploy --network fantom
```

Afterwards navigate to your deployed contract on ftmscan and use adventureAll() to adventure your entire party!
