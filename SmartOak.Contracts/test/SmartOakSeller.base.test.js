const SmartOakToken = artifacts.require('SmartOakToken');
const NameRegistry = artifacts.require('NameRegistry');
const SmartOakCompany = artifacts.require('SmartOakCompany');

const SmartOakStore = artifacts.require('SmartOakStore');
const SmartOakSeller = artifacts.require('SmartOakSeller');


import { latestTime } from 'openzeppelin-solidity/test/helpers/latestTime';
import { increaseTimeTo, duration } from 'openzeppelin-solidity/test/helpers/increaseTime';
import { ether } from 'openzeppelin-solidity/test/helpers/ether';
import EVMRevert from 'openzeppelin-solidity/test/helpers/EVMRevert';
const helper = require("./testHelper");
const BigNumber = web3.BigNumber;
const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
  
  contract('SmartOakSeller tests', function (accounts) {
       var data = {};
       const RATE = new BigNumber(400);
       const DECIMAL_TOKEN_DIFFERENCE = new BigNumber(10000000);
   
          beforeEach(async function () {

            data.nameRegistry = await NameRegistry.new();

            data.token = await SmartOakToken.new(data.nameRegistry.address);
            data.company = await SmartOakCompany.new(data.nameRegistry.address, accounts[0],accounts[1],accounts[2]);
            data.store = await SmartOakStore.new(data.nameRegistry.address);

            await increaseTimeTo(this.openingTime+duration.hours(1));

            await helper.distributeTokens(data, accounts);
            await helper.transferOwnership(data, data.company.address);
           
                
          });
          
          
          describe('SmartOakSeller base test', function () {
            it('changePrice method should not be accessible ', async function () {
                await data.company.addGame(1, 5, 10);
                await data.company.addGame(1, 5, 10, {from:accounts[1]});
                
                var gameAddress = await data.store.gameContracts(1);
                var seller = await SmartOakSeller.at(gameAddress);

                await seller.changePrice(10, {from:accounts[6]}).should.be.rejectedWith(EVMRevert);
               
            });

            it('addLicence method should not be accessible ', async function () {
              await data.company.addGame(1, 5, 10);
              await data.company.addGame(1, 5, 10, {from:accounts[1]});
              
              var gameAddress = await data.store.gameContracts(1);
              var seller = await SmartOakSeller.at(gameAddress);
              await seller.addLicence(10, {from:accounts[6]}).should.be.rejectedWith(EVMRevert);

          });

          it('purchaseGame(address) method should not be accessible ', async function () {
            await data.company.addGame(1, 5, 10);
            await data.company.addGame(1, 5, 10, {from:accounts[1]});
            
            var gameAddress = await data.store.gameContracts(1);
            var seller = await SmartOakSeller.at(gameAddress);
            await seller.purchaseGame(accounts[6], {from:accounts[6]}).should.be.rejectedWith(EVMRevert);
            

        });

        it('purchaseGame method should not be accessible ', async function () {
          await data.company.addGame(1, 5, 10);
          await data.company.addGame(1, 5, 10, {from:accounts[1]});
          
          var gameAddress = await data.store.gameContracts(1);
          var seller = await SmartOakSeller.at(gameAddress);

          await seller.purchaseGame(1,{from:accounts[6]}).should.be.rejectedWith(EVMRevert);

          });
            
      });    
        
  });

 
  
  
  
  
  