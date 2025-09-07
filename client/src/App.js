import React, { useEffect, useState } from "react";
import Web3 from "web3";
import CharityDonation from "./abis/Donation.json";

function App() {
  const [account, setAccount] = useState("");
  const [accountBalance, setAccountBalance] = useState("0");
  const [contractBalance, setContractBalance] = useState("0");
  const [donationAmount, setDonationAmount] = useState("");
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [loading, setLoading] = useState(true);

  const CONTRACT_ADDRESS = "0xa14c55524c5060fb2833505DE67d182AFA57eaAf"; // Update if redeployed

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async (retries = 3) => {
    setLoading(true);
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        console.log("Connected account:", accounts[0]);

        for (let i = 0; i < retries; i++) {
          const accBalanceWei = await web3Instance.eth.getBalance(accounts[0]);
          const accBalance = web3Instance.utils.fromWei(accBalanceWei, "ether");
          console.log(`Account balance attempt ${i+1}:`, accBalance);
          if (accBalance > 0 || i === retries - 1) {
            setAccountBalance(accBalance);
            break;
          }
          await new Promise(r => setTimeout(r, 1000));
        }

        const donationContract = new web3Instance.eth.Contract(CharityDonation.abi, CONTRACT_ADDRESS);
        setContract(donationContract);
        console.log("Contract address:", CONTRACT_ADDRESS);

        for (let i = 0; i < retries; i++) {
          const contBalance = await donationContract.methods.getBalance().call();
          const contBalanceEth = web3Instance.utils.fromWei(contBalance, "ether");
          console.log(`Contract balance attempt ${i+1}:`, contBalanceEth);
          if (contBalance >= 0 || i === retries - 1) {
            setContractBalance(contBalanceEth);
            break;
          }
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (error) {
        console.error("Load error:", error);
      }
    } else {
      alert("MetaMask not found!");
    }
    setLoading(false);
  };

  const donate = async () => {
    if (contract && donationAmount && web3) {
      try {
        await contract.methods.donate().send({
          from: account,
          value: web3.utils.toWei(donationAmount, "ether"),
        });
        loadBlockchainData();
        setDonationAmount("");
        alert("Donation successful!");
      } catch (error) {
        console.error("Donation error:", error);
        alert("Failed: " + error.message);
      }
    } else {
      alert("Enter amount and connect!");
    }
  };

  const refreshBalances = () => loadBlockchainData();

  if (loading) return <div className="text-center py-10 text-gray-300">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <h1 className="text-2xl font-semibold text-white mb-6 text-center border-b border-gray-700 pb-2">Charity Donation Platform</h1>
        <div className="space-y-5">
          <p className="text-gray-300"><strong>Account:</strong> {account ? account.slice(0, 6) + "..." + account.slice(-4) : "Not connected"}</p>
          <p className="text-gray-300"><strong>Account Balance:</strong> <span className="text-green-400">{accountBalance}</span> ETH</p>
          <p className="text-gray-300"><strong>Contract Balance:</strong> <span className="text-green-400">{contractBalance}</span> ETH</p>
          <div className="flex space-x-3">
            <input
              type="number"
              step="0.01"
              placeholder="Amount in ETH"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="flex-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={donate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">Donate</button>
            <button onClick={refreshBalances} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200">Refresh</button>
          </div>
        </div>
        <p className="text-sm text-gray-500 text-center mt-6">For debugging, check browser console (F12).</p>
      </div>
      <style>
        {`
          @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');

          .min-h-screen {
            min-height: 100vh;
          }
          .bg-gray-900 {
            background-color: #1a202c;
          }
          .bg-gray-800 {
            background-color: #2d3748;
          }
          .border-gray-700 {
            border-color: #4a5568;
          }
          .text-gray-300 {
            color: #a0aec0;
          }
          .text-green-400 {
            color: #68d391;
          }
          .bg-blue-600 {
            background-color: #2563eb;
          }
          .hover\:bg-blue-700:hover {
            background-color: #1d4ed8;
          }
          .bg-gray-600 {
            background-color: #4a5568;
          }
          .hover\:bg-gray-700:hover {
            background-color: #2d3748;
          }
          .focus\:ring-2:focus {
            ring-width: 2px;
          }
          .focus\:ring-blue-500:focus {
            ring-color: #3b82f6;
          }
          .transition {
            transition-property: background-color;
          }
          .duration-200 {
            transition-duration: 200ms;
          }
          .shadow-xl {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
          }
        `}
      </style>
    </div>
  );
}

export default App;