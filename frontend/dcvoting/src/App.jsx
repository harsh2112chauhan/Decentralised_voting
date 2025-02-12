import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";

const CONTRACT_ADDRESS = "0x0Cc7B9d60Fd08589c90B1235CB7524e47228461D"; // Replace with your deployed contract address
const ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "CandidateAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "candidateId",
        "type": "uint256"
      }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "addCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "candidates",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "voteCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "candidatesCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCandidates",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "voteCount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Voting.Candidate[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateId",
        "type": "uint256"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

function App() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [owner, setOwner] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [newCandidateName, setNewCandidateName] = useState("");

  useEffect(() => {
    const connectWallet = async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      const signer = await web3Provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const ownerAddress = await contract.owner();

      setProvider(web3Provider);
      setSigner(signer);
      setContract(contract);
      setOwner(ownerAddress);
      setUserAddress(await signer.getAddress());
    };

    connectWallet();
  }, []);

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!contract) return;
      try {
        const candidatesArray = await contract.getCandidates();
        setCandidates(candidatesArray);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      }
    };

    fetchCandidates();
  }, [contract]);

  const vote = async () => {
    if (!selectedCandidate) return;
    try {
      const tx = await contract.vote(selectedCandidate);
      await tx.wait();
      alert("Vote cast successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Voting error:", error);
      alert("Error casting vote. Maybe you already voted?");
    }
  };

  const addCandidate = async () => {
    if (!newCandidateName) return;
    try {
      const tx = await contract.addCandidate(newCandidateName);
      await tx.wait();
      alert(`Candidate "${newCandidateName}" added!`);
      setNewCandidateName("");
      window.location.reload();
    } catch (error) {
      console.error("Add candidate error:", error);
      alert("Error adding candidate. Only the owner can add candidates.");
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Decentralized Voting</h1>
      </header>

      <section className="info">
        <p>
          <strong>Contract Owner:</strong> {owner}
        </p>
        <p>
          <strong>Your Address:</strong> {userAddress}
        </p>
      </section>

      <main>
        <section className="candidates">
          <h2>Candidates</h2>
          {candidates.length > 0 ? (
            <div className="candidate-list">
              {candidates.map((c) => (
                <div key={c.id} className="candidate-card">
                  <div className="candidate-details">
                    <h3>{c.name}</h3>
                    <p>{c.voteCount.toString()} votes</p>
                  </div>
                  <button
                    className={`vote-button ${
                      selectedCandidate === c.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedCandidate(c.id)}
                  >
                    {selectedCandidate === c.id ? "Selected" : "Vote"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-candidates">No candidates yet.</p>
          )}
          <div className="submit-vote">
            <button
              className="submit-button"
              onClick={vote}
              disabled={!selectedCandidate}
            >
              Submit Vote
            </button>
          </div>
        </section>

        {owner &&
          owner.toLowerCase() === userAddress?.toLowerCase() && (
            <section className="admin">
              <h2>Add Candidate (Owner Only)</h2>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Candidate Name"
                  value={newCandidateName}
                  onChange={(e) => setNewCandidateName(e.target.value)}
                />
                <button className="add-button" onClick={addCandidate}>
                  Add Candidate
                </button>
              </div>
            </section>
          )}
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} Voting Dapp</p>
      </footer>
    </div>
  );
}

export default App;
