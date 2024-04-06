import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const ArbitrageBotModule = buildModule("ArbitrageBotModule", (m) => {
  // Assuming your ArbitrageBot constructor takes an initialOwner address as a parameter
  const initialOwner = m.getParameter("initialOwner", "0xF1AB3c15a55fBDcd8b6275029d114a4B7a554d96");

  const arbitrageBot = m.contract("ArbitrageBot", [initialOwner]);

  return { arbitrageBot };
});

export default ArbitrageBotModule;