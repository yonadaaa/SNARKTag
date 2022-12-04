// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";
import { console } from "forge-std/console.sol";

import { UNITS } from "../systems/CreateSystem.sol";
import { ListComponent, ID as ListComponentID, List } from "../components/ListComponent.sol";

uint256 constant ID = uint256(keccak256("system.Vector"));

contract VectorSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    ListComponent listComponent = ListComponent(getAddressById(components, ListComponentID));

    // for (uint256 i; i < UNITS; i++) {
    //   Actions memory actions = ListComponent.getValue(i);
    //   console.log(actions.xs.length);
    // }
  }

  function executeTyped() public returns (bytes memory) {
    return execute("");
  }
}
