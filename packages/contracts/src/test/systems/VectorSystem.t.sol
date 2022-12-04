// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "../MudTest.t.sol";
import { CreateSystem, ID as CreateSystemID, UNITS } from "../../systems/CreateSystem.sol";
import { VectorSystem, ID as VectorSystemID } from "../../systems/VectorSystem.sol";

contract VectorSystemTest is MudTest {
  function testExecute() public {
    CreateSystem(system(CreateSystemID)).executeTyped(100);

    VectorSystem(system(VectorSystemID)).executeTyped();
  }
}
