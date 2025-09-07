module.exports = {
  networks: {
    development: {
  host: "127.0.0.1",
  port: 8545,   // match CLI port
  network_id: "*"
}

  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.21" // Match your contract compiler version
    }
  }
};

