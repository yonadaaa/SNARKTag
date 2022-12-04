// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { FieldCoordComponent } from "./FieldCoordComponent.sol";

uint256 constant ID = uint256(keccak256("component.Position"));

contract PositionComponent is FieldCoordComponent {
  constructor(address world) FieldCoordComponent(world, ID) {}
}
