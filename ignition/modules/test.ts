import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import "@nomicfoundation/hardhat-ignition";



const testModule = buildModule("testModule", (m) => {
  // Assuming your ArbitrageBot constructor takes an initialOwner address as a parameter
  const initialOwner = m.getParameter("initialOwner", "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097");

  const arbitrageBot = m.contract("ArbitrageBot", [initialOwner]);
  

  return { arbitrageBot };
});

export default testModule;