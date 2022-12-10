// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";

import { CreatedComponent, ID as CreatedComponentID } from "../components/CreatedComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "../components/PositionComponent.sol";
import { Position } from "../components/FieldCoordComponent.sol";
import { SpeedComponent, ID as SpeedComponentID } from "../components/SpeedComponent.sol";
import { VectorComponent, ID as VectorComponentID } from "../components/VectorComponent.sol";
import { IndexComponent, ID as IndexComponentID } from "../components/IndexComponent.sol";
import { ItComponent, ID as ItComponentID } from "../components/ItComponent.sol";
import { RateComponent, ID as RateComponentID } from "../components/RateComponent.sol";
import { StartComponent, ID as StartComponentID } from "../components/StartComponent.sol";

uint256 constant ID = uint256(keccak256("system.Create"));

uint256 constant SINGLETON_ID = 123456789;
uint256 constant UNITS = 3;
uint256 constant STEPS = 10;
uint256 constant DIMENSIONS = 2;
uint256 constant HYPOTENUSE = 841;
uint256 constant SPEED = 0;
uint256 constant PRIME = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
uint256 constant PRIME_THIRD = PRIME / 3;
uint256 constant ORIGIN = 2 ** 31;
uint256 constant RANGE = 2 ** 32;

contract CreateSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    CreatedComponent createdComponent = CreatedComponent(getAddressById(components, CreatedComponentID));

    require(!createdComponent.has(SINGLETON_ID), "Game already created");

    uint256 rate = abi.decode(arguments, (uint256));

    IndexComponent indexComponent = IndexComponent(getAddressById(components, IndexComponentID));
    ItComponent itComponent = ItComponent(getAddressById(components, ItComponentID));
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    SpeedComponent speedComponent = SpeedComponent(getAddressById(components, SpeedComponentID));
    VectorComponent vectorComponent = VectorComponent(getAddressById(components, VectorComponentID));
    RateComponent rateComponent = RateComponent(getAddressById(components, RateComponentID));
    StartComponent startComponent = StartComponent(getAddressById(components, StartComponentID));

    createdComponent.set(SINGLETON_ID, abi.encode(true));
    rateComponent.set(SINGLETON_ID, rate);
    startComponent.set(SINGLETON_ID, block.timestamp * 1000); // TODO: let the deployer choose the start timestamp?

    // TODO: use world.getUniqueID ?
    for (uint256 i; i < UNITS; i++) {
      indexComponent.set(i, i);
      speedComponent.set(i, SPEED);
      vectorComponent.set(i, Position(0, 0));

      if (i == 0) {
        itComponent.set(i, abi.encode(true));
        positionComponent.set(i, Position(10000, 10000));
      } else if (i == 1) {
        itComponent.set(i, abi.encode(false));
        positionComponent.set(i, Position(40000, 40000));
      } else {
        itComponent.set(i, abi.encode(false));
        positionComponent.set(i, Position(80000, 80000));
      }
    }
  }

  function executeTyped(uint256 rate) public returns (bytes memory) {
    return execute(abi.encode(rate));
  }
}
