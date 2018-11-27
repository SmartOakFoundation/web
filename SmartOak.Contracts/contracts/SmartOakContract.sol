pragma solidity ^0.4.24;
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract SmartOakContract is Ownable {

    modifier onlyHuman(address addr){
        uint size;
        assembly { size := extcodesize(addr) } // solium-disable-line
        if(size == 0){
            _;
        }else{
            revert("Provided address is a contract");
        }
    }
    
}