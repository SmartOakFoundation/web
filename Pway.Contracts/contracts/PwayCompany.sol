pragma solidity ^0.4.24;
import "./PwayContract.sol";
import "./PwayToken.sol";
import "./PwayGamesStore.sol";
import "./NameRegistry.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


interface IGamesStore{
	function getPriceInUSD(uint32 _ethGameId) public returns(uint256);
	function getPrice(uint32 _ethGameId) public returns(uint256);
	function withdraw() public;
	function changePrice(uint32 _gameId,uint _price) public;
	function createGame(uint32 _gameId, uint _gamePrice, uint32 _licenseCount) public;
	function changePwayRate(uint32 _pwayRate) public;
	function addLicence(uint32 _gameId,uint _amount) public;
}


contract PwayCompany is PwayContract {

    event ConfirmationNeeded(uint256 sumTried, address user);
    event OperationProcessed(address finalCaller, uint256 operationValue, bytes data);
    event MethodCalled(bytes methodAndArgs, uint256 user);
    event ProviderQueried(address _provider);
    NameRegistry private reg ;
    uint256 private DECIMALS_MULTIPLAYER ;
    
    mapping (address=>uint256) private allowedAddressesMappedToUsers;
    mapping (bytes32=>uint256[]) private functionsConfirmations;

	using SafeMath for uint256;
    
    constructor(
        NameRegistry _reg, 
        address governor1,
        address governor2,
        address governor3) public {

        reg = _reg;
        
        PwayToken token = PwayToken(reg.getAddress("PwayToken"));
        DECIMALS_MULTIPLAYER = uint256(10)**(18-token.decimals());

        addAdmin(governor1, 1);
        addAdmin(governor2, 2);
        addAdmin(governor3, 3);

        reg.setAddress("PwayCompany", address(this));

    }

    function addAdmin(address _adr, uint256 _userId) internal {
        require(_adr!=address(0));
        require(allowedAddressesMappedToUsers[_adr]==0);
        allowedAddressesMappedToUsers[_adr]=_userId;
    }

	function checkIfFunctionHasBeenCalledBefore(bytes msg_data,address msg_sender) returns(bool){
	
        bool isPresent = false;
        uint256[] storage confirmedBy = functionsConfirmations[keccak256(msg_data)];
        for (uint8 i = 0; i<confirmedBy.length; i++){
            if(confirmedBy[i]==allowedAddressesMappedToUsers[msg_sender]){
                isPresent = true;
            }
        }
        return isPresent;
	}
	
    function guardSumAndCaller(uint256 sumOfEth,bool requiresTwoConfirmations) private returns (bool){
	
        require(allowedAddressesMappedToUsers[msg.sender]>0);

		bool isPresent = checkIfFunctionHasBeenCalledBefore(msg.data,msg.sender);

		uint256[] storage confirmedBy = functionsConfirmations[keccak256(msg.data)];

        if(isPresent==false){
            confirmedBy.push(allowedAddressesMappedToUsers[msg.sender]);
            functionsConfirmations[keccak256(msg.data)] = confirmedBy;
        }

		bool sufficentNumberOfConfirmations = confirmedBy.length>1;

        if( sufficentNumberOfConfirmations ||  requiresTwoConfirmations==false ){
            functionsConfirmations[keccak256(msg.data)].length = 0;

            emit MethodCalled(msg.data, allowedAddressesMappedToUsers[msg.sender]);
            emit OperationProcessed(msg.sender,sumOfEth,msg.data);
            return true;
        }
        else{
            emit MethodCalled(msg.data, allowedAddressesMappedToUsers[msg.sender]);
            emit ConfirmationNeeded(sumOfEth,msg.sender);
			return false;
        }
    }
   
    function () public payable{
    }
   
    function addAdminAlias(address _adr,address _aliasOf)  public{
		if(guardSumAndCaller(0,true)){
			require(allowedAddressesMappedToUsers[_aliasOf]!=0);
			require(allowedAddressesMappedToUsers[_adr]==0);
			allowedAddressesMappedToUsers[_adr]=allowedAddressesMappedToUsers[_aliasOf];
		}
    }   

    function removeAdminAlias(address _adr,address _aliasOf) public {
		if(guardSumAndCaller(0,true) ){
			require(allowedAddressesMappedToUsers[_aliasOf]!=0);
			require(allowedAddressesMappedToUsers[_adr]==allowedAddressesMappedToUsers[_aliasOf]);
			require(_adr!=_aliasOf);
			allowedAddressesMappedToUsers[_adr]=0;
		}
    }   
    function getNow() constant public returns(uint256){
        return now;
    }

    function transferFunds(address _to,uint256 _sum)  public {
		if(guardSumAndCaller(0,true) ){
			_to.transfer(_sum);
		}
    }


    function transferTokens(address _to,uint256 _funds)  public {
		if(guardSumAndCaller(_funds/DECIMALS_MULTIPLAYER,false) ){
			PwayToken token = PwayToken(reg.getAddress("PwayToken"));
			token.transfer(_to,_funds);
		}
    }
	
	
    function getPriceInUSD(uint256  _ethereumGameId) view public returns(uint256){
        IGamesStore store = IGamesStore(reg.getAddress("GamesStore"));
		return store.getPriceInUSD(uint32(_ethereumGameId));
    }

    function getPrice(uint256  _ethereumGameId) view public returns(uint256){
        IGamesStore store = IGamesStore(reg.getAddress("GamesStore"));
		return store.getPrice(uint32(_ethereumGameId));
    }

    function withdrawFromStore()  public {
		if(guardSumAndCaller(0,false) ){
			IGamesStore store = IGamesStore(reg.getAddress("GamesStore"));
			store.withdraw();
		}
    }

    function addGame(uint32 _gameId, uint _gamePrice, uint32 _licenseCount)  public {
		if(guardSumAndCaller(0,true)){
			IGamesStore store = IGamesStore(reg.getAddress("GamesStore"));
			store.createGame(_gameId,_gamePrice,_licenseCount);
		}
    }

    function changeGamePrice(uint32 _gameId,uint256 _price) public {
		if(guardSumAndCaller(0,false)){
			IGamesStore store = IGamesStore(reg.getAddress("GamesStore"));
			store.changePrice(_gameId,_price);
		}
    }

    function changePwayRate(uint256 _price) public {
		if(guardSumAndCaller(0,false)){
			IGamesStore store = IGamesStore(reg.getAddress("GamesStore"));
			store.changePwayRate(uint32(_price));
		}
    }   

    function addLicence(uint32 _gameId,uint _amount) public{
		if(guardSumAndCaller(0,false)){
			IGamesStore store = IGamesStore(reg.getAddress("GamesStore"));
			store.addLicence(_gameId,_amount);
		}
    }   
    
    function generalCall(address to,bytes msgData) public {
		if(guardSumAndCaller(0,true)){
			require(to.call(msgData));
		}
    }   


    function updateCompany(address _to) public{ 
		if(guardSumAndCaller(0,true)){
			PwayToken token = PwayToken(reg.getAddress("PwayToken"));

			_to.transfer(address(this).balance);
			token.transfer(address(_to),token.balanceOf(address(this)));
			reg.setAddress("PwayCompany",_to);
		}
    }
}