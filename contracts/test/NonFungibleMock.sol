pragma solidity ^0.4.23;


import "./../CurioAuction.sol";


/**
 * @title NonFungibleMock
 * @dev Mock implementation of NonFungible, aiming for simplicity.
 */
contract NonFungibleMock is ERC721 {

  struct MockNFT {
    uint256 id;
  }

  MockNFT[] tokens;

  mapping (uint => address) tokenIdToOwner;

  mapping (uint => address) allowances;

  function implementsERC721() public pure returns (bool){
    return true;
  }

  function _owns(
    address _claimant,
    uint256 _tokenId
  )
    internal
    view
    returns (bool)
  {
    return tokenIdToOwner[_tokenId] == _claimant;
  }

  function _approvedFor(
    address _claimant,
    uint256 _tokenId
  )
    internal
    view
    returns (bool)
  {
    return allowances[_tokenId] == _claimant;
  }

  function createToken() public returns (uint) {
    uint256 id = tokens.length + 1;

    tokens.push(MockNFT(id));

    tokenIdToOwner[id] = msg.sender;
  }

  function totalSupply() public view returns (uint) {
    return tokens.length;
  }

  function balanceOf(address _owner) public view returns (uint) {
    uint256 balance = 0;

    for (uint256 i = 0; i < totalSupply(); i++) {
      if (tokenIdToOwner[tokens[i].id] == _owner) {
        balance++;
      }
    }

    return balance;
  }

  function tokensOfOwnerByIndex(
    address _owner,
    uint256 _index
  )
    external
    view
    returns (uint256 tokenId)
  {
    uint256 indexCounter = 0;

    for (uint256 i = 0; i < totalSupply(); i++) {
      if (tokenIdToOwner[tokens[i].id] == _owner) {
        if (indexCounter == _index) {
          return tokens[i].id;
        } else {
          indexCounter++;
        }
      }
    }

    return 0;
  }

  function ownerOf(uint256 _tokenId) external view returns (address owner) {
    return tokenIdToOwner[_tokenId];
  }

  function transfer(
    address _to,
    uint256 _tokenId
  )
    external
  {
    require(_owns(msg.sender, _tokenId));
    // NOTE: This implementation does not clear approvals on transfer for simplicity
    // A complete implementation should do this.
    tokenIdToOwner[_tokenId] = _to;
  }

  function approve(
    address _to,
    uint256 _tokenId
  )
    external
  {
    require(_owns(msg.sender, _tokenId));
    allowances[_tokenId] = _to;
  }

  function transferFrom(
    address _from,
    address _to,
    uint256 _tokenId
  )
    external
  {
    require(_approvedFor(msg.sender, _tokenId));
    require(_owns(_from, _tokenId));
    // NOTE: This implementation does not clear approvals on transfer for simplicity
    // A complete implementation should do this.
    tokenIdToOwner[_tokenId] = _to;
  }

  address public ownerAddress;

  modifier onlyOwner() {
    require(msg.sender == ownerAddress);
    _;
  }

  CurioAuction public auction;

  constructor() public {
    ownerAddress = msg.sender;
  }

  function setAuctionAddress(address _address) onlyOwner external {
    CurioAuction candidateContract = CurioAuction(_address);

    // NOTE: verify that a contract is what we expect
    // https://github.com/Lunyr/crowdsale-contracts/blob/cfadd15986c30521d8ba7d5b6f57b4fefcc7ac38/contracts/LunyrToken.sol#L117
    require(candidateContract.isCurioAuction());

    // Set the new contract address
    auction = candidateContract;
  }

  function createAuction(
    uint256 _tokenId,
    uint256 _startingPrice,
    uint256 _endingPrice,
    uint256 _duration
  )
    external
  {
    require(_owns(msg.sender, _tokenId));

    allowances[_tokenId] = auction;

    auction.createAuction(
      _tokenId,
      _startingPrice,
      _endingPrice,
      _duration,
      msg.sender
    );
  }
}
