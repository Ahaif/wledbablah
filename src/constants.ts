import { ethers } from 'ethers';
require('dotenv').config();



const network = 'rinkeby';
const providerUrl = `https://${network}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
export const provider = new ethers.providers.JsonRpcProvider(providerUrl);