import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { encryptVoteVector } from "./encrypt";
import { initialize } from 'zokrates-js';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Button,
  Paper,
  CssBaseline,
  TextField,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Avatar,
  createTheme,
  ThemeProvider,
  Box,
} from "@mui/material";
import { Brightness4, Brightness7, HowToVote } from "@mui/icons-material";
import { styled } from "@mui/system";
import "./App.css";

const CONTRACT_ADDRESS = "0xEd846D02417DAB6E9cE4026cb49E10608A484200";
const ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "cnt",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
        "indexed": true,
        "internalType": "uint256",
        "name": "candidateId",
        "type": "uint256"
      }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "winnerName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "winnerVoteCount",
        "type": "uint256"
      }
    ],
    "name": "VotingEnded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "VotingReset",
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
    "name": "count",
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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "encryptedSums",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "endVotingAndDeclareWinner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllEncryptedSums",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
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
    "name": "getCandidate",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
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
        "components": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "X",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "Y",
                "type": "uint256"
              }
            ],
            "internalType": "struct Pairing.G1Point",
            "name": "a",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint256[2]",
                "name": "X",
                "type": "uint256[2]"
              },
              {
                "internalType": "uint256[2]",
                "name": "Y",
                "type": "uint256[2]"
              }
            ],
            "internalType": "struct Pairing.G2Point",
            "name": "b",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "X",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "Y",
                "type": "uint256"
              }
            ],
            "internalType": "struct Pairing.G1Point",
            "name": "c",
            "type": "tuple"
          }
        ],
        "internalType": "struct Verifier.Proof",
        "name": "proof",
        "type": "tuple"
      },
      {
        "internalType": "uint256[2]",
        "name": "input",
        "type": "uint256[2]"
      }
    ],
    "name": "verifyTx",
    "outputs": [
      {
        "internalType": "bool",
        "name": "r",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string[]",
        "name": "encryptedVoteVector",
        "type": "string[]"
      },
      {
        "internalType": "uint256[2]",
        "name": "a",
        "type": "uint256[2]"
      },
      {
        "internalType": "uint256[2][2]",
        "name": "b",
        "type": "uint256[2][2]"
      },
      {
        "internalType": "uint256[2]",
        "name": "c",
        "type": "uint256[2]"
      },
      {
        "internalType": "uint256[2]",
        "name": "input",
        "type": "uint256[2]"
      }
    ],
    "name": "vote",
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
    "name": "voterAddresses",
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
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "voters",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const FullHeightBox = styled(Box)(({ theme }) => ({
  minHeight: "100vh",width: "100vw",
  padding: theme.spacing(4, 2),
  backgroundImage: `url('/images/images2.jpg')`,
  backgroundSize: "contain",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backdropFilter: "brightness(0.9)",
}));

function App() {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [contract, setContract] = useState(null);
  const [owner, setOwner] = useState(null);
  const [userAddr, setUserAddr] = useState(null);
  const [newName, setNewName] = useState("");
  const [winner, setWinner] = useState({ name: "", votes: 0 });
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: { mode: darkMode ? "dark" : "light" },
    typography: { fontFamily: "'Poppins', sans-serif" },
  });

 
  useEffect(() => {
    async function init() {
      if (!window.ethereum) return alert("Install MetaMask");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      setContract(c);
      setOwner(await c.owner());
      setUserAddr(await signer.getAddress());
    }
    init();
  }, []);

  // 2) fetch candidates
  const fetchCandidates = async () => {
    if (!contract) return;
    const count = await contract.candidatesCount();
    const arr = [];
    for (let i = 0; i < count; i++) {
      const [name, votesBN] = await contract.getCandidate(i);
      arr.push({ id: i, name, votes: votesBN.toString() });
    }
    setCandidates(arr);
  };
  useEffect(() => {
    fetchCandidates();
  }, [contract]);

  // 3) end voting
  const endVoting = async () => {
    if (!contract) return;

    const tx1 = await contract.getAllEncryptedSums();
    console.log(JSON.stringify(tx1));
    contract.once("VotingEnded", (wName, wCount) => {
      setWinner({ name: wName, votes: wCount.toString() });
    });
    const tx = await contract.endVotingAndDeclareWinner();
    await tx.wait();
  };


  const [status, setStatus] = useState('');
  const generateProof = async (myvote, mxcandidate) => {
    setStatus('Initializing ZoKrates...');
    const zokratesProvider = await initialize();
  
    setStatus('Fetching artifacts...');
    const response = await fetch('/out');
    const program = await response.arrayBuffer();
  
    const provingKeyResponse = await fetch('/proving.key');
    const provingKey = await provingKeyResponse.arrayBuffer();
  
    setStatus('Computing witness...');
    
    // CORRECT ABI STRUCTURE FOR YOUR .zok FILE
    // const artifacts = {
    //   program: new Uint8Array(program),
    //   abi: {
    //     "inputs": [
    //       { "name": "vote", "type": "field", "visibility": "private" },
    //       { "name": "maxCandidateId", "type": "field", "visibility": "public" }
    //     ],
    //     "outputs": [{ "name": "return", "type": "bool" }]
    //   }
    // };

      const artifacts = {
      program: new Uint8Array(program),
      abi: 
      {
        "inputs": [
          {
            "name": "vote",
            "public": false,
            "type": "field"
          },
          {
            "name": "maxCandidateId",
            "public": true,
            "type": "field"
          }
        ],
        "output": {
          "type": "bool"
        }
      }
    };

    console.log(myvote, "          ", mxcandidate)
    // Input order must match .zok file: vote first, then maxCandidateId
    const inputs = [String(myvote), String(mxcandidate)];
  
    try {
      const { witness } = await zokratesProvider.computeWitness(artifacts, inputs);
  
      setStatus('Generating proof...');
      const proof = await zokratesProvider.generateProof(
        artifacts.program,
        witness,
        new Uint8Array(provingKey)
      );
  
      console.log('Proof:', proof);
      setStatus('Proof generated successfully!');
      return proof;
    } catch (error) {
      console.error('Proof generation failed:', error);
      setStatus(`Error: ${error.message}`);
      throw error;
    }
  };


  // vote & add
  const vote = async () => {
    if (selected === null) return;
    try {
      const encryptedVector = await encryptVoteVector(selected, 3);
      const proof = await generateProof(selected+1, candidates.length);
      console.log(proof);
      // const tx = await contract.vote(encryptedVector);
      const tx = await contract.vote(
        encryptedVector,                        // string[] of encrypted votes
        [proof.proof.a[0], proof.proof.a[1]],       // uint[2]
        [                                           // uint[2][2]
          [proof.proof.b[0][0], proof.proof.b[0][1]],
          [proof.proof.b[1][0], proof.proof.b[1][1]],
        ],
        [proof.proof.c[0], proof.proof.c[1]],       // uint[2]
        proof.inputs.map(i => BigInt(i))            // uint[]
      );
      await tx.wait();
      alert("Vote cast successfully!");
      fetchCandidates(); // Refresh list
    } catch (error) {
      console.error("Voting error:", error);
      alert("Error casting vote. Maybe you already voted?");
    }
  };
  const addCandidate = async () => {
    if (!newName.trim()) return;
    await (await contract.addCandidate(newName)).wait();
    setNewName("");
    fetchCandidates();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary">
        <Toolbar>
          <HowToVote sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Decentralized Voting DApp
          </Typography>
          <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <FullHeightBox>
        <Container style={{ width: "60%" }}>
          {/* <Typography variant="subtitle1">
            <strong>Owner:</strong> {owner}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            <strong>You:</strong> {userAddr}
          </Typography> */}

          {winner.name && (
            <Paper elevation={6} sx={{ p: 3, mb: 4, bgcolor: "background.paper" }}>
              <Typography variant="h4" color="success.main">
                🏆 Winner: {winner.name}
              </Typography>
              <Typography variant="h6">Votes: {winner.votes}</Typography>
            </Paper>
          )}

          <Grid container spacing={3}>
            {candidates.length ? (
              candidates.map((c) => (
                <Grid item xs={12} sm={6} md={4} key={c.id}>
                  <Card sx={{ height: "100%" }} elevation={4}>
                    <CardContent sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                        <HowToVote />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{c.name}</Typography>
                        <Typography variant="body2">
                          {c.votes} votes
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        fullWidth
                        variant={selected === c.id ? "contained" : "outlined"}
                        onClick={() => setSelected(c.id)}
                      >
                        {selected === c.id ? "Selected" : "Select"}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography>No candidates yet.</Typography>
            )}
          </Grid>

          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              size="large"
              disabled={selected === null}
              onClick={vote}
            >
              Submit Vote
            </Button>
          </Box>

          {owner?.toLowerCase() === userAddr?.toLowerCase() && (
            <Paper elevation={3} sx={{ mt: 6, p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Admin Controls
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="New Candidate Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button fullWidth variant="contained" onClick={addCandidate}>
                    Add Candidate
                  </Button>
                </Grid>
              </Grid>
              <Box mt={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  onClick={endVoting}
                >
                  End Voting & Declare Winner
                </Button>
              </Box>
            </Paper>
          )}
        </Container>
      </FullHeightBox>

      <Box component="footer" sx={{ py: 2, textAlign: "center" }}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} Voting DApp — Made By Aniket, Hardik, Harsh, Hemant
        </Typography>
      </Box>
    </ThemeProvider>
  );
}

export default App;