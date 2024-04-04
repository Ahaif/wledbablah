import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const ArbitrageBotModule = buildModule("ArbitrageBotModule", (m) => {
  // Assuming your ArbitrageBot constructor takes an initialOwner address as a parameter
  const initialOwner = m.getParameter("initialOwner", "0xf8c3Ad10cd0BF7BFc208d03A80C56d4D835801C6");

  const arbitrageBot = m.contract("ArbitrageBot", [initialOwner]);

  return { arbitrageBot };
});

export default ArbitrageBotModule;