const path = require('path');
const scriptName = path.basename(__filename);
const logger = require('../utils/logger')(scriptName);
var NameRegistry = artifacts.require("./NameRegistry.sol");
var PwayToken = artifacts.require("./PwayToken.sol");
var PwayCompany = artifacts.require("./PwayCompany.sol");
var PwayGamesStore = artifacts.require("./PwayGamesStore.sol");
const config = require("./config");
const helper = require("./deplymentHelpers");

const IS_PRODUCTION = true;

var methodTimeout = 300;// infura servers delay

module.exports = function (deployer, network, accounts) {

    const addr = config.getAddresses(IS_PRODUCTION, accounts);
    helper.setWeb3(web3);

    var data = {};
    data.events = [];
    data.logs = [];
    
    logger.info(`'Deployment started for network: ${network} with owner: ${accounts[0]}`);

    if (network === "rinkeby") {
       
    }
    else if (network === "local" || network === "testrpc") {
        return;
    }
    else if (network === "development") {
        logger.info(`Send some money`);

        // helper.transferEther(web3, accounts[0], addr.devAdam, 2);
        // helper.transferEther(web3, accounts[0], addr.devLukas, 2);
    }

    var gameConfig = addr.gamesConfig;

    var licences = [];
    var prices = [];
    for (var i = 0; i < gameConfig.length; i++) {
        licences.push(gameConfig[i].licenseCount);
        prices.push(gameConfig[i].Usd11DigitPrice);
    }

    //  logger.info(`'Deployment started for network: ${network} with owner: ${accounts[0]}`);

    var contractFactory = function (contract, contractNameVariable, ...args) {
        // logger.info(`Deploying ${contractNameVariable} with args ${args}`);

        return new Promise(function (resolve, reject) {
            deployer.deploy(contract, ...args)
                .then(function () {
                    contract.deployed()
                        .then(function (instance) {
                            helper.assignEventWatcher(instance, data, function (ev) {
                                if (ev.event === 'WalletCreated') {
                                    console.log('Wallet ! ' + ev.args.walletAddress + ' beneficiary=' + ev.args.beneficiary);
                                    console.log(JSON.stringify(ev.args));
                                }
                            });
                            Object.defineProperty(data, contractNameVariable, { value: instance, writable: false });
                            logger.info(`${contractNameVariable} deployed at  ${contract.address}`);

                            setTimeout(function () {
                                resolve(contract);
                            }, methodTimeout);
                        })
                        .catch(function (err) { reject(err) });
                })
                .catch(function (err) {
                    logger.error(`Error during  ${contractNameVariable} deployment. Args : ${args} Raw error: ${err}`);
                    reject('Error during ' + contractNameVariable + ' deployment. Args : ' + args + ' Raw error: ' + err);
                });
        });
    };

    var changeOwner = function (comment, instance, ownerAddress) {
        return new Promise(function (res, rej) {
            helper.executeMethod("Change owner of " + comment, instance, instance.transferOwnership, methodTimeout, ownerAddress).then(function () {
                console.log("tx to wait for", arguments[0].tx);
                helper.waitForTxEnds(web3.eth, arguments[0].tx, function () {
                    res(true);
                });
            }).catch((err) => {
                console.log("change owner", err);
                rej(false);
            });
        });
    };


    var scriptToRun = new Promise((res, rej) => {
        contractFactory(NameRegistry, 'reg')
            .then(function () { return contractFactory(PwayToken, 'PwayToken', data.reg.address); })
            .then(function () { return contractFactory(PwayGamesStore, 'GamesStore', data.reg.address); })
            .then(function () {
                return contractFactory(PwayCompany, 'PwayCompany', data.reg.address, addr.governor1, addr.governor2, addr.governor3)
            })
            .then(function () { return helper.executeMethod("Create games", data.GamesStore, data.GamesStore.createGames, methodTimeout, prices, licences); })
            .then(function () { return changeOwner("Game store", data.GamesStore, data.PwayCompany.address); })
            .then(function () { return changeOwner("Pway Company", data.PwayCompany, data.PwayCompany.address); })
            .then(function () { return changeOwner("Pway Token",data.PwayToken, data.PwayCompany.address); })
            .then(function () {
                console.log('clean recivers');
                helper.removeEventWatcher(data);
                res(true);
            })
            .catch(function (error) {
                helper.removeEventWatcher(data);
                logger.error(`Finished with fail ${error}`);
                rej('Deployment failed');
            });
    });

    deployer.then(function () {
        return scriptToRun;
    });
};
