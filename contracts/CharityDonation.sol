// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract CharityDonation {
    address public owner;
    uint256 public totalDonations;

    event Donated(address indexed donor, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);

    constructor() {
        owner = msg.sender; // contract deployer is the owner
        totalDonations = 0; // initialize
    }

    // function to donate ether
    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than zero");
        totalDonations += msg.value;
        emit Donated(msg.sender, msg.value);
    }

    // function to withdraw by owner
    function withdraw(uint256 amount) public {
        require(msg.sender == owner, "Only owner can withdraw");
        require(amount <= address(this).balance, "Not enough balance");
        payable(owner).transfer(amount);
        emit Withdrawn(owner, amount);
    }

    // check balance inside the contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
