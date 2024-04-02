const ArbitrageExecutor = artifacts.require("ArbitrageExecutor");

module.exports = function(deployer) {
  deployer.deploy(ArbitrageExecutor);
};