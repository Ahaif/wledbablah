import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import "@nomicfoundation/hardhat-ignition";



const ArbitrageBotModule = buildModule("ArbitrageBotModule", (m) => {
  // Assuming your ArbitrageBot constructor takes an initialOwner address as a parameter
  const initialOwner = m.getParameter("initialOwner", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  const addressesProvider = m.getParameter("addressesProvider", "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"); // Aave V3 Mainnet Addresses Provider

  const arbitrageBot = m.contract("ArbitrageBot", [initialOwner, addressesProvider]);

  

  return { arbitrageBot };
});

export default ArbitrageBotModule;