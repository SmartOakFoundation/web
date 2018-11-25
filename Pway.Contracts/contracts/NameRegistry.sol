pragma solidity ^0.4.24;
import './PwayContract.sol';

/** @title Name Registry
*   Map name to contract address
*/
contract NameRegistry is PwayContract {

    event EntrySet(string entry,address adr);

    mapping(string => address) names;

    /**
    * @dev Check is name is registered 
    * @param name 
    * @return True if registered, false otherwise 
    */
    function hasAddress(string name) public view returns(bool) {
        return names[name] != address(0);
    }
    
     /**
    * @dev Return address of registerd name
    * @param name 
    * @return Addres if registered, 0x0 otherwise 
    */
    function getAddress(string name) public view returns(address) {
        require(names[name] != address(0), "Address could not be 0x0");
        return names[name];
    }

    /**
    * @dev Return current block time
    * @return epoch time
    */
    function getNow() public view returns(uint) {
        return now;
    }
    
    /**
    * @dev Register address for a given name
    * @param name 
    * @param _adr address
    */
    function setAddress(string name, address _adr) public {
        require(_adr != address(0), "Address could not be 0x0");

        bytes memory nameBytes = bytes(name);
        require(nameBytes.length > 0, "Name could not be empty");

        bool isEmpty = names[name] == address(0);

        //can be initialized by everyone , but only change by itself
        require(isEmpty || names[name] == msg.sender);

        names[name] = _adr;
        emit EntrySet(name, names[name]);
    } 
  
}
