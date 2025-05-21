const hre = require("hardhat");
require("dotenv").config();

// scripts/deploy.js

async function main() {
  // Compile & get the factory
  const Voting = await hre.ethers.getContractFactory("Voting");

  // Kick off the deployment
  const voting = await Voting.deploy(0);
  console.log("⏳  Deployment transaction hash:", voting.deploymentTransaction().hash);

  // Wait for the contract to be mined
  await voting.waitForDeployment();

  // The deployed address is now stored in voting.target
  console.log("✅  Voting deployed to:", voting.target);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("❌  Error deploying contract:", error);
    process.exit(1);
  });
