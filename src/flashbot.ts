import { ethers, Wallet, Contract } from "ethers";
import axios from 'axios';  // Axios is used for HTTP requests
import ArbitrageBotModuleABI from './contracts/ABIs/ArbitrageBotModuleABI.json';

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const privateKey = process.env.PRIVATE_KEY || "";
const signer = new Wallet(privateKey, provider);
const authSigner = new Wallet(process.env.FLASHBOTS_SIGNER_KEY || ethers.Wallet.createRandom().privateKey);

const contractAddress = "0xa1e757125a93160e6dcaD78af4641e6796C4463e";
const arbitrageBot = new Contract(contractAddress, ArbitrageBotModuleABI.abi, signer);

export async function sendFlashbotsTransaction(assetAddress: string, loanAmount: string, direction: string) {
    let  blockNumber: any = await provider.getBlockNumber();
    blockNumber += 1;  // Send the bundle in the next block
    const hexBlockNumber = '0x' + blockNumber.toString(16);

    const txRequest = await arbitrageBot.initiateFlashLoan.populateTransaction(assetAddress, ethers.parseUnits(loanAmount, 18), direction);
    const signedTransaction = await signer.signTransaction({
        ...txRequest,
        gasLimit: 1000000n,  // specify a sufficient gas limit
        chainId: (await provider.getNetwork()).chainId
    });
    // const signature = await authSigner.signMessage(ethers.arrayify(ethers.keccak256(signedTransaction)));


    console.log("Signed transaction:", signedTransaction);

    const flashbotsRPC = "https://relay.flashbots.net";
    const payload = {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_sendBundle",
        params: [{
            txs: [signedTransaction],
            blockNumber: hexBlockNumber,
            // minTimestamp: 0,  // Optional: specify if needed
            // maxTimestamp: Math.floor(Date.now() / 1000) + 120  // 2 minutes from now
        }]
    };

    try {
        const response = await axios.post(flashbotsRPC, payload, {
            headers: {
                'Content-Type': 'application/json',
                // 'X-Flashbots-Signature': `${authSigner.address}:${signature}`
            }
        });
        console.log('Bundle submitted, response:', response.data);
    } catch (error : any) {
        console.error("Error sending Flashbots bundle:", error.response ? error.response.data : error.message);
    }
}

export default sendFlashbotsTransaction;
