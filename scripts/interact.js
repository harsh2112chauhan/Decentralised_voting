const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const contractAddress = "0xEf49189bB856E2fa945e5B7B69a925cF51aC859B"; 
    const Voting = await ethers.getContractAt("Voting", contractAddress);

    // Add a Candidate (Only Owner)
    let tx = await Voting.addCandidate("Alice");
    await tx.wait();
    console.log("Added candidate: Alice");

    // Fetch Candidate
    let candidate = await Voting.getCandidate(0);
    console.log(`Candidate 0: ${candidate[0]} - Votes: ${candidate[1]}`);

    // Cast a vote
    tx = await Voting.vote(0);
    await tx.wait();
    console.log("Voted for candidate 0");

    // Fetch Candidate After Voting
    candidate = await Voting.getCandidate(0);
    console.log(`Candidate 0: ${candidate[0]} - Votes: ${candidate[1]}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
