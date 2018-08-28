pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol";
import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

// TODO 5 tests for each contract 

contract Fun2derToken is StandardToken {
  string public constant name = "Fun2der Token";
  string public constant symbol = "F2D";
  uint8 public constant decimals = 18;
}

// Ref openzeppelin-solidity/SampleCrowdsale
contract Fun2derCrowdsale is CappedCrowdsale, RefundableCrowdsale {
  constructor(
    uint256 _openingTime,
    uint256 _closingTime,
    uint256 _rate,
    address _wallet,
    uint256 _cap,
    Fun2derToken _token,
    uint256 _goal
  )
    public 
    Crowdsale(_rate, _wallet, _token)
    CappedCrowdsale(_cap)
    TimedCrowdsale(_openingTime, _closingTime)
    RefundableCrowdsale(_goal)
  {
    //As goal needs to be met for a successful crowdsale
    //the value needs to less or equal than a cap which is limit for accepted funds
    require(_goal <= _cap, "Goal needs to less or equal than a cap");
  }
}

contract Project is Ownable {
  // Back link to Fun2der..
  Fun2der public fun2der;
  bytes32 public name;
  bytes32 public desc;
  // Host img and content on IPFS
  bytes32 public img;
  bytes32 public content;
  address public beneficiary;
  Fun2derToken public token;
  // TODO Be struct to have desc etc?
  Fun2derCrowdsale[] public campaigns;
  
  event ProjectCreate(
    bytes32 name,
    bytes32 desc,
    bytes32 img,
    bytes32 content,
    address indexed beneficiary,
    Fun2derToken indexed token
  );
  
  constructor(Fun2der _fun2der, bytes32 _name, bytes32 _desc, bytes32 _img, bytes32 _content, address _beneficiary) public {
    fun2der = _fun2der;
    name = _name;
    desc = _desc;
    img = _img;
    content = _content;
    beneficiary = _beneficiary;
    // Create token for the lifetime of product crowdsale, by Project
    token = new Fun2derToken();
    // token.mint(0xca35b7d915458ef540ade6068dfe2f44e8fa733c, 123);
    // token.mint(0xca35b7d915458ef540ade6068dfe2f44e8fa733c, 456);
    emit ProjectCreate(_name, _desc, img, content, _beneficiary, token);
  }
  
  function hasActiveCampaign() public view returns (bool) {
    return campaigns.length > 0 && !campaigns[campaigns.length - 1].isFinalized();
  }
  
  function hasFinalizableCampaign() public view returns (bool) {
    if (!hasActiveCampaign()) {
      return false;
    }
    Fun2derCrowdsale campaign = campaigns[campaigns.length - 1];
    return !campaign.isFinalized() && campaign.hasClosed();
  }    
  
  function getRounds() public view returns (uint256) {
    return campaigns.length;
  }
  
  function canFinalize() private view returns (bool) {
    // TODO Is it safe for anyone to finalize?
    return msg.sender == beneficiary || msg.sender == fun2der.owner(); 
  }
  
  function newCampaign(
    uint256 _openingTime,
    uint256 _closingTime,
    uint256 _cap,
    uint256 _goal
  ) public returns (Fun2derCrowdsale campaign) {
    require(beneficiary == msg.sender, "Only project beneficiary can starts a new campaign");
    require(!hasActiveCampaign(), "Only one campaign can be ongoing");
    // Create crowdsale campaign, by Project
    campaign = new Fun2derCrowdsale(
      _openingTime, _closingTime, 1, beneficiary, _cap, token, _goal);
    campaigns.push(campaign);
  }
  
  function quickCampaign(uint _minutes) public returns (Fun2derCrowdsale) {
    require(_minutes > 2, "Don't Panic =)");
    return newCampaign(now + 10, now + _minutes* 60, 100, 60);
  }
  
  // Finalize current active campaign, if any
  function finalize() public {
    require(hasActiveCampaign(), "Need an active campaign for finalizing");
    require(canFinalize(), "Only project beneficiary or fun2der can finalize a campaign");
    // TODO Probably rope here. 
    // Also, is it safe to call finalize by anyone any times to do malicious before gas depletion failure?
    Fun2derCrowdsale(campaigns[campaigns.length - 1]).finalize();
  }
}

/**
 * @title Fun2der, a.k.a funfunder or funder having fun.
 * @dev Main contract for managing projects.
 */
contract Fun2der is Ownable {
  address[] internal projects;
  // TODO highlights
  mapping(address => address[]) public fundraisers;
  
  function createProject(bytes32 _name, bytes32 _desc, bytes32 _img, bytes32 _content) public returns (address _project) {
    // Create project, by Fun2der
    _project = new Project(this, _name, _desc, _img, _content, msg.sender);
    projects.push(_project);
    fundraisers[msg.sender].push(_project);
  }
  
  function quickProject() public returns (address) {
    return createProject("Hello World", "Quick description", "", "");
  }
  
  function getProjectCount() public view returns (uint256) {
    return projects.length;
  }
  
  function getProject(uint256 _idx) public view returns (
    bytes32 _name, uint256 _funding, uint256 _rounds, bool _hasActiveCampaign) {
    Project _project = Project(projects[_idx]);
    _name = _project.name();
    _funding = _project.token().totalSupply();
    _rounds = _project.getRounds();
    _hasActiveCampaign = _project.hasActiveCampaign();
  }
  
  function getOwnProjects() public view returns (address[]) {
    return fundraisers[msg.sender];
  }
}

