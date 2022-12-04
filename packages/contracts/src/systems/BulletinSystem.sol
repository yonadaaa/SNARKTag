// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";

import { ListComponent, ID as ListComponentID, List } from "../components/ListComponent.sol";
import { SINGLETON_ID, UNITS } from "../systems/CreateSystem.sol";

uint256 constant ID = uint256(keccak256("system.Bulletin"));

contract BulletinSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 entity, uint256 x, uint256 y) = abi.decode(arguments, (uint256, uint256, uint256));

    ListComponent listComponent = ListComponent(getAddressById(components, ListComponentID));

    uint256[] memory addresses;
    uint256[] memory timestamps;
    uint256[] memory xs;
    uint256[] memory ys;

    if (!listComponent.has(entity)) {
      for (uint256 i; i < UNITS; i++) {
        listComponent.set(i, List(addresses, timestamps, xs, ys));
      }
    }

    List memory list = listComponent.getValue(entity);

    uint256 length = list.timestamps.length;
    uint256 newLength = length + 1;
    addresses = new uint256[](newLength);
    timestamps = new uint256[](newLength);
    xs = new uint256[](newLength);
    ys = new uint256[](newLength);
    for (uint256 i; i < length; i++) {
      addresses[i] = list.addresses[i];
      timestamps[i] = list.timestamps[i];
      xs[i] = list.xs[i];
      ys[i] = list.ys[i];
    }

    addresses[length] = uint256(uint160(msg.sender));
    timestamps[length] = block.timestamp;
    xs[length] = x;
    ys[length] = y;

    listComponent.set(entity, List(addresses, timestamps, xs, ys));
  }

  function executeTyped(
    uint256 unit,
    uint256 x,
    uint256 y
  ) public returns (bytes memory) {
    return execute(abi.encode(unit, x, y));
  }
}
