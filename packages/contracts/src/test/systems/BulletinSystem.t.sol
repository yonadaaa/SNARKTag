// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "../MudTest.t.sol";
import { CreateSystem, ID as CreateSystemID, UNITS } from "../../systems/CreateSystem.sol";
import { BulletinSystem, ID as BulletinSystemID } from "../../systems/BulletinSystem.sol";
import { ListComponent, ID as ListComponentID, List } from "../../components/ListComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "../../components/PositionComponent.sol";
import { Position } from "../../components/FieldCoordComponent.sol";

contract BulletinSystemTest is MudTest {
  function testExecute() public {
    ListComponent listComponent = ListComponent(component(ListComponentID));

    uint256 entity = 0;

    for (uint256 i; i < 10; i++) {
      BulletinSystem(system(BulletinSystemID)).executeTyped(entity, i, i);
      List memory newList = listComponent.getValue(entity);

      for (uint256 j; j < i + 1; j++) {
        assertEq(newList.xs[j], j);
        assertEq(newList.ys[j], j);
      }
    }
  }
}
