import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import "@nomicfoundation/hardhat-ignition";



const ArbitrageBotModule = buildModule("ArbitrageBotModule", (m) => {
  // Assuming your ArbitrageBot constructor takes an initialOwner address as a parameter
  const initialOwner = m.getParameter("initialOwner", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  const addressesProvider = m.getParameter("addressesProvider", "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e"); // Aave V3 Mainnet Addresses Provider

  const arbitrageBot = m.contract("ArbitrageBot", [initialOwner, addressesProvider]);

  

  return { arbitrageBot };
});

export default ArbitrageBotModule;