pragma solidity ^0.4.23;


import "./../Curio.sol";


/**
 * @title CurioTest
 * @dev Implementation of core contract for tests.
 */
contract CurioTest is Curio {

  constructor() public {}

  function mintTokens(string _name, uint32 _cloneCount) onlyAdmin whenNotPaused public {
    require(_cloneCount > 0);

    for (uint256 i = 0; i < _cloneCount; i++) {
      _createToken(_name, msg.sender);
    }
  }

  /**
  * @dev For tests we can easily fund the contract.
  */
  function fundMe() public payable returns (bool) {
    return true;
  }

  function timeNow() public constant returns (uint256) {
    return now;
  }
}
