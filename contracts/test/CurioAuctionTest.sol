pragma solidity ^0.4.23;


import "./../CurioAuction.sol";


/**
 * @title CurioAuctionTest
 * @dev Implementation of auction contract for tests.
 */
contract CurioAuctionTest is CurioAuction {
  constructor(
    address _tokenAddress,
    uint256 _fee
  ) public
    CurioAuction(
      _tokenAddress,
        _fee
    )
  {

  }

  function _calculateCurrentPricePublic(
    uint256 _startingPrice,
    uint256 _endingPrice,
    uint256 _duration,
    uint256 _secondsPassed
  )
    external
    pure
    returns (uint256)
  {
    return _calculateCurrentPrice(
      _startingPrice,
      _endingPrice,
      _duration,
      _secondsPassed
    );
  }

}
