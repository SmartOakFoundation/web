pragma solidity ^0.4.24;

import './SmartOakContract.sol';
import './NameRegistry.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract SmartOakToken is StandardToken, Ownable, SmartOakContract {
	
    string public symbol = "Fund";
    string public name = "FUND";
    uint8 public decimals = 11;

    constructor(NameRegistry registry)  public {
        owner = msg.sender;
        totalSupply_ = (82000000*(uint256(10)**decimals));
        balances[msg.sender] = totalSupply_;

        registry.setAddress("SmartOakToken", address(this));
    }
  
    function burn(uint256 amount) public {
        require(balanceOf(msg.sender)>=amount);
        totalSupply_ = totalSupply_.sub(amount);
        balances[msg.sender] = balances[msg.sender].sub(amount);
		emit Transfer(msg.sender,address(0),amount);
    }

    function withdrawForeignTokens(address _tokenContract) public returns (bool) {
        require(_tokenContract != address(this));
        
        ERC20 token = ERC20(_tokenContract);
        uint256 amount = token.balanceOf(address(this));
        return token.transfer(owner, amount);
    }
  
}

