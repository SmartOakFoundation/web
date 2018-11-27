module.exports = {

    getAddresses: function (isProd, accounts) {
        if (isProd)
            return this.production(accounts);
        else
            return this.development(accounts);
    },

    development: function (accounts) {
        var data = {
            gamesConfig: [
                { ethId: 1, Usd11DigitPrice: "1599000000000", licenseCount: 50 },
                { ethId: 2, Usd11DigitPrice: "699000000000", licenseCount: 50 },
                { ethId: 3, Usd11DigitPrice: "699000000000", licenseCount: 50 },
            ]
        };
       
        return data;
    },

    production: function (accounts) {
        var data = { //TODO change
            gamesConfig: [
                { ethId: 1, Usd11DigitPrice: "1599000000000", licenseCount: 50 },
                { ethId: 2, Usd11DigitPrice: "699000000000", licenseCount: 50 },
                { ethId: 3, Usd11DigitPrice: "699000000000", licenseCount: 50 },
            ],

            governor1: "0x501b73b7e60C24B76B92f9074948282cD76a79af",
            governor2: "0x94da43c587c515ad30ea86a208603a7586d2c25f",//"0x58c6dede9e15b9aecb501a5c265e12d49e189d68",
            governor3: accounts[0]

        };
       
        return data;
    }
}