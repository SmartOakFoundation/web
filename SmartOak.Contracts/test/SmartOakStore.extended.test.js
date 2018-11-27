const SmartOakToken = artifacts.require('SmartOakToken');
const NameRegistry = artifacts.require('NameRegistry');
const SmartOakCompany = artifacts.require('SmartOakCompany');
const SmartOakStore = artifacts.require('SmartOakStore');
const helper = require("./testHelper");

import { increaseTimeTo, duration } from 'openzeppelin-solidity/test/helpers/increaseTime';


const BigNumber = web3.BigNumber;
const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
  
  contract('SmartOakSeller tests', function (accounts) {
       var data = {};
       const RATE = new BigNumber(400);
       const DECIMAL = 10**11;
   
          beforeEach(async function () {
            
            data.nameRegistry = await NameRegistry.new();
       
            data.token = await SmartOakToken.new(data.nameRegistry.address);

            data.store = await SmartOakStore.new(data.nameRegistry.address);
            data.company = await SmartOakCompany.new(data.nameRegistry.address,  accounts[0],accounts[1],accounts[2]);
          
            await data.token.transfer(accounts[6], 100*DECIMAL);
            await helper.transferOwnership(data, data.company.address);
          
            await increaseTimeTo(this.openingTime+2);
          });
          
          //TODO withdraw 30 % to token dividend 
          describe('SmartOakSeller extended test', function () {

            it('should return user games', async function () {
            
              await data.company.addGame(1, 5 * DECIMAL, 10);
              await data.company.addGame(1, 5 * DECIMAL, 10, {from:accounts[1]});

              await data.company.addGame(2, 5 * DECIMAL, 10);
              await data.company.addGame(2, 5 * DECIMAL, 10, {from:accounts[1]});

              await data.company.addGame(3, 5 * DECIMAL, 10);
              await data.company.addGame(3, 5 * DECIMAL, 10, {from:accounts[1]});

              await data.company.addGame(4, 5 * DECIMAL, 10);
              await data.company.addGame(4, 5 * DECIMAL, 10, {from:accounts[1]});
            
              await data.token.approve(data.store.address, 100 * DECIMAL, { from: accounts[6] });
              
              await data.store.buyGame(4, { from: accounts[6] });
              await data.store.buyGame(4, { from: accounts[6] });
              await data.store.buyGame(4, { from: accounts[6] });
              
              var listing = await data.store.getAccountLicences(accounts[6],0);
              
              var licences = helper.getAllLicences(listing);
              
              licences.length.should.be.eq(3);
              licences[0].gameId.should.be.equal(4);
              licences[1].gameId.should.be.equal(4);
              licences[2].gameId.should.be.equal(4);
            
           });
          });    
  });


  
  
  
  
  