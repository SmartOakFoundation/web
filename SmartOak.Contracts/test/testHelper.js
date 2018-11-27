module.exports = {
  getGameId: function (binary) {
    var bGameId = binary.slice(0, binary.length - 32);
    return parseInt(bGameId, 2);
  },

  getLicence: function (binary) {
    var bLicence = binary.slice(binary.length - 32, binary.length);
    return parseInt(bLicence, 2);
  },

  getAllLicences: function (listing) {
    var licences = [];

    for (var i = 0; i < 64; i++) {
      var binary = listing[i].toString(2);
      if (binary.length > 1)
        licences.push({ gameId: this.getGameId(binary), licenceId: this.getLicence(binary) })
    }

    return licences;
  },

  distributeTokens: async function (data, accounts) {
    await data.token.transfer(accounts[9], "5000000" + "00000000000"); //private sale
    await data.token.transfer(data.company.address, "20000000" + "00000000000");
  },

  transferOwnership : async function(data, to) {
    data.token ? await data.token.transferOwnership(to) : console.log("data.token undefined !!!!!!");
    data.store ? await data.store.transferOwnership(to) : console.log("data.store undefined !!!!!!");
  }
  
}