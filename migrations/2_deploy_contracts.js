require('dotenv').config();
const GNSPairInfosV6_1 = artifacts.require("GNSPairInfosV6_1");
const GNSTradingV6_1 = artifacts.require("GNSTradingV6_1");
const GNSTradingCallbacksV6_1 = artifacts.require("GNSTradingCallbacksV6_1");

module.exports = function(deployer) {
  deployer.deploy(GNSPairInfosV6_1,"0x006042665d8F2A165630619a8eA2AE6376714Eb2");
  deployer.deploy(GNSTradingCallbacksV6_1,"0x006042665d8F2A165630619a8eA2AE6376714Eb2","0x006042665d8F2A165630619a8eA2AE6376714Eb2");
  deployer.deploy(GNSTradingV6_1,"0x006042665d8F2A165630619a8eA2AE6376714Eb2","0x006042665d8F2A165630619a8eA2AE6376714Eb2");

};
