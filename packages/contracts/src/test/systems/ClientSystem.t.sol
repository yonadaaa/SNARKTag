// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "../MudTest.t.sol";
import { CreateSystem, ID as CreateSystemID, UNITS } from "../../systems/CreateSystem.sol";
import { ClientSystem, ID as ClientSystemID } from "../../systems/ClientSystem.sol";
import { BulletinSystem, ID as BulletinSystemID } from "../../systems/BulletinSystem.sol";
import { ListComponent, ID as ListComponentID, List } from "../../components/ListComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "../../components/PositionComponent.sol";
import { Position } from "../../components/FieldCoordComponent.sol";
import { transitionVerifier } from "../../dependencies/transitionVerifier.sol";

// TODO: generate proofs with FFI
contract ClientSystemTest is MudTest {
  function testExecute() public {
    PositionComponent positionComponent = PositionComponent(component(PositionComponentID));
    ClientSystem clientSystem = ClientSystem(system(ClientSystemID));

    CreateSystem(system(CreateSystemID)).executeTyped(100);

    for (uint256 i; i < UNITS; i++) {
      Position memory position = positionComponent.getValue(i);
      if (i == 0) {
        assertEq(position.x, 0);
      }
      assertEq(position.y, 0);
    }

    Position[UNITS] memory position_out;
    uint256[8] memory proofData;

    // Session is created at t=1, so warp to t=2
    for (uint256 i = 2; i < 10; i++) {
      vm.expectRevert();
      clientSystem.executeTyped(proofData, position_out);

      vm.warp(i);

      ClientSystem(system(ClientSystemID)).executeTyped(proofData, position_out);

      for (uint256 j; j < UNITS; j++) {
        Position memory position = positionComponent.getValue(j);
        assertEq(position.x, 0);
        assertEq(position.y, 0);
      }
    }
  }
}
