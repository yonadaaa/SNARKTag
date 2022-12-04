// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";

import { DIMENSIONS, STEPS, UNITS } from "../systems/CreateSystem.sol";
import { PositionComponent, ID as PositionComponentID } from "../components/PositionComponent.sol";
import { Position } from "../components/FieldCoordComponent.sol";
import { ListComponent, ID as ListComponentID } from "../components/ListComponent.sol";
import { RateComponent, ID as RateComponentID } from "../components/RateComponent.sol";
import { StartComponent, ID as StartComponentID } from "../components/StartComponent.sol";
import { transitionsVerifier } from "../dependencies/transitionsVerifier.sol";
import { SINGLETON_ID } from "../systems/CreateSystem.sol";

uint256 constant ID = uint256(keccak256("system.Client"));

uint256 constant IN_OFFSET = UNITS * DIMENSIONS;
uint256 constant VECTORS_OFFSET = IN_OFFSET + UNITS * DIMENSIONS;

// 2 * 3 = 6 position outs
// 2 * 3 = 6 position ins
// 3 * 10 * 2 = 60 vectors

contract ClientSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    RateComponent rateComponent = RateComponent(getAddressById(components, RateComponentID));
    StartComponent startComponent = StartComponent(getAddressById(components, StartComponentID));

    uint256 lastSync = startComponent.getValue(SINGLETON_ID);
    uint256 span = STEPS * rateComponent.getValue(SINGLETON_ID);

    require(block.timestamp * 1000 - lastSync >= span, "Not enough time has passed since the last sync");
    startComponent.set(SINGLETON_ID, lastSync + span);

    (uint256[8] memory proofData, Position[3] memory position_out) = abi.decode(arguments, (uint256[8], Position[3]));

    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    ListComponent listComponent = ListComponent(getAddressById(components, ListComponentID));

    uint256[32] memory inputs;

    for (uint256 i; i < UNITS; i++) {
      uint256 offset = i * 2;

      inputs[offset] = position_out[i].x;
      inputs[offset + 1] = position_out[i].y;

      Position memory position = positionComponent.getValue(i);
      inputs[offset + IN_OFFSET] = position.x;
      inputs[offset + IN_OFFSET + 1] = position.y;
    }

    transitionsVerifier verifier = new transitionsVerifier();

    // Frame 0, Unit 0
    // Frame 0, Unit 1
    // Loop through all the events. If they take place in
    // This should start with the vectors as they are
    for (uint256 i; i < STEPS * 3; i++) {
      uint256 offset = i * 2;

      inputs[offset + VECTORS_OFFSET] = 841000000000000000000000000000000000000000000000000000000000000000000000000;
      inputs[offset + VECTORS_OFFSET + 1] = 0;
    }

    require(verifier.verifyProof(proofData, inputs), "Proof verification failed");

    for (uint256 i; i < UNITS; i++) {
      positionComponent.set(i, position_out[i]);
    }
  }

  function executeTyped(uint256[8] memory proofData, Position[UNITS] memory position_out)
    public
    returns (bytes memory)
  {
    return execute(abi.encode(proofData, position_out));
  }
}
