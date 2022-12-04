// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";
import { FieldCoordComponent } from "./FieldCoordComponent.sol";

uint256 constant ID = uint256(keccak256("component.Vector"));

contract VectorComponent is FieldCoordComponent {
  constructor(address world) FieldCoordComponent(world, ID) {}
}
