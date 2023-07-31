window.addEventListener('load', async () => {
    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
    } else {
      console.log('Please install MetaMask or use a web3-enabled browser.');
    }

    const contractAddress = "0x7Cf65D40fdb615a4300B5d7795FbD95C88f6d4c9"; // Replace with your deployed contract address
    const contractAbi = [
        {
            "inputs": [],
            "name": "closeVoting",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string[]",
                    "name": "_candidateNames",
                    "type": "string[]"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_candidateIndex",
                    "type": "uint256"
                }
            ],
            "name": "vote",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
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
                    "name": "candidateIndex",
                    "type": "uint256"
                }
            ],
            "name": "VoteCast",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "winningCandidateIndex",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "winnerName",
                    "type": "string"
                }
            ],
            "name": "VotingClosed",
            "type": "event"
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
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_index",
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
            "name": "getCandidateCount",
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
            "name": "getContractOwner",
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
        },
        {
            "inputs": [],
            "name": "votingClosed",
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
            "name": "winningCandidateIndex",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]; // Replace with your contract ABI
    const votingContract = new web3.eth.Contract(contractAbi, contractAddress);

    // Get the contract owner address
    const ownerAddress = await votingContract.methods.getContractOwner().call();
    document.getElementById('ownerAddress').textContent = ownerAddress;

    // Load candidates
    const candidateCount = await votingContract.methods.getCandidateCount().call();
    const candidatesList = document.getElementById('candidatesList');
    const candidateSelect = document.getElementById('candidateSelect');

    for (let i = 0; i < candidateCount; i++) {
      const candidate = await votingContract.methods.getCandidate(i).call();
      const li = document.createElement('li');
      li.textContent = `${candidate[0]} - Votes: ${candidate[1]}`;
      candidatesList.appendChild(li);

      const option = document.createElement('option');
      option.value = i.toString();
      option.text = candidate[0];
      candidateSelect.appendChild(option);
    }

    // Vote button click event
    const voteButton = document.getElementById('voteButton');
    voteButton.addEventListener('click', async () => {
      const selectedCandidateIndex = document.getElementById('candidateSelect').value;

      if (selectedCandidateIndex === '') {
        window.alert('Please select a candidate.');
        return;
      }

      try {
        const accounts = await web3.eth.getAccounts();
        const fromAddress = accounts[0]; // Use the first account from the connected accounts

        await votingContract.methods.vote(selectedCandidateIndex).send({ from: fromAddress });
        window.alert('Vote submitted successfully!');
      } catch (error) {
        console.error(error);
        window.alert(`An error occurred while submitting your vote: ${error.message}`);
      }
    });

    // Listen for VotingClosed event
    const votingClosedEvent = votingContract.events.VotingClosed();
    votingClosedEvent.on('data', async (event) => {
      const winningCandidateIndex = event.returnValues.winningCandidateIndex;
      const winnerName = await votingContract.methods.getCandidate(winningCandidateIndex).call();
      document.getElementById('winnerName').textContent = winnerName[0];
    });
  });