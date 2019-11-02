const Dogs = artifacts.require('Dogs');
const DogsUpdated = artifacts.require('DogsUpdated');
const Proxy = artifacts.require('Proxy');

module.exports = async function(deployer, network, accounts){
  //Deploy contracts
  const dogs = await Dogs.new();
  const proxy = await Proxy.new(dogs.address);

  //Create proxyDog to fool Truffle.
  //It reads functions directed to Proxy.sol as though they're directed to Dogs.sol
  var proxyDog = await Dogs.at(proxy.address);

  //Set the number of dogs through the proxy
  await proxyDog.setNumberOfDogs(10);

  //Tested
  var nrOfDogs = await proxyDog.getNumberOfDogs();
  console.log("Before update: " + nrOfDogs.toNumber());

  //Deploy Updated Dogs contract
  const dogsUpdated = await DogsUpdated.new();
  proxy.upgrade(dogsUpdated.address);

  //Fool Truffle again, but with updated dogs contract.
  proxyDog = await DogsUpdated.at(proxy.address);

  //Initialize the state of proxy contract so it's the same as the updated dog contract.
  proxyDog.initialize(accounts[0]);

  //Call to check that storage remained
  nrOfDogs = await proxyDog.getNumberOfDogs();
  console.log("After update: " + nrOfDogs.toNumber());

  //Set the number of dogs through the proxy with UPDATED functional contract
  await proxyDog.setNumberOfDogs(30);

  //Call to check that setNumberOfDogs works with updated dogs contract
  nrOfDogs = await proxyDog.getNumberOfDogs();
  console.log("After change: " + nrOfDogs.toNumber());

}
