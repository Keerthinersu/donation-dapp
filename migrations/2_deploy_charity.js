const CharityDonation = artifacts.require("CharityDonation");

module.exports = async function (deployer) {
  await deployer.deploy(CharityDonation, { gas: 6721975 });
};
