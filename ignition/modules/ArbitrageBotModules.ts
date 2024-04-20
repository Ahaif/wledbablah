import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import "@nomicfoundation/hardhat-ignition";



const ArbitrageBotModule = buildModule("ArbitrageBotModule", (m) => {
  // Assuming your ArbitrageBot constructor takes an initialOwner address as a parameter
  const initialOwner = m.getParameter("initialOwner", "0xF1AB3c15a55fBDcd8b6275029d114a4B7a554d96");
  const addressesProvider = m.getParameter("addressesProvider", "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A"); // Aave V3 Mainnet Addresses Provider

  const arbitrageBot = m.contract("ArbitrageBot", [initialOwner, addressesProvider]);

  

  return { arbitrageBot };
});

export default ArbitrageBotModule;