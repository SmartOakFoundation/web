const PwayToken = artifacts.require('PwayToken');
const NameRegistry = artifacts.require('NameRegistry');
const PwayCompany = artifacts.require('PwayCompany');


import { latestTime } from 'openzeppelin-solidity/test/helpers/latestTime';
import { increaseTimeTo, duration } from 'openzeppelin-solidity/test/helpers/increaseTime';
import { ether } from 'openzeppelin-solidity/test/helpers/ether';

const helper = require("./testHelper");
const BigNumber = web3.BigNumber;
const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('PwayCompany', function (accounts) {
    var data = {};
    const RATE = new BigNumber(400);


    beforeEach(async function () {

        data.nameRegistry = await NameRegistry.new();
        var dividendStartTime = await data.nameRegistry.getNow();
        dividendStartTime = dividendStartTime + duration.days(180);
        data.token = await PwayToken.new(data.nameRegistry.address);

        data.DECIMALS = await data.token.decimals();
        await data.nameRegistry.setAddress("GamesStore", data.token.address); // just to satisfy construction of whiteList

        data.company = await PwayCompany.new(data.nameRegistry.address,  accounts[1], accounts[2], accounts[3]);
     
        await helper.distributeTokens(data, accounts);
        await helper.transferOwnership(data, data.company.address);

    });


    describe('PwayCompany base test', function () {
   

        it('should allow send money from some adresses', async function () {
            var companyBeforeBalance = await web3.eth.getBalance(data.company.address);
            await data.company.sendTransaction({ from:accounts[1], value:ether(1)});
            var companyAfterBalance = await web3.eth.getBalance(data.company.address);
            return companyAfterBalance.minus(companyBeforeBalance).should.be.bignumber.equal(ether(1));
        });

    
        it('should send any amount of ether by double call', async function () {

            web3.eth.sendTransaction({ from: accounts[7], to: data.company.address, value: ether(2) });

            var Acc5BeforeBalance = await web3.eth.getBalance(accounts[5]);

            await data.company.transferFunds(accounts[5],ether(1.5),{from:accounts[1]});
            await data.company.transferFunds(accounts[5],ether(1.5),{from:accounts[2]});
            var Acc5AfterBalance = await web3.eth.getBalance(accounts[5]);
            return Acc5AfterBalance.minus(Acc5BeforeBalance).should.be.bignumber.equal(ether(1.5));

        });

    });

});
