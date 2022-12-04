// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct List {
  uint256[] addresses;
  uint256[] timestamps;
  uint256[] xs;
  uint256[] ys;
}

uint256 constant ID = uint256(keccak256("component.List"));

contract ListComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](4);
    values = new LibTypes.SchemaValue[](4);

    keys[0] = "addresses";
    values[0] = LibTypes.SchemaValue.UINT256_ARRAY;

    keys[1] = "timestamps";
    values[1] = LibTypes.SchemaValue.UINT256_ARRAY;

    keys[2] = "xs";
    values[2] = LibTypes.SchemaValue.UINT256_ARRAY;

    keys[3] = "ys";
    values[3] = LibTypes.SchemaValue.UINT256_ARRAY;
  }

  function set(uint256 entity, List calldata value) public {
    set(entity, abi.encode(value.addresses, value.timestamps, value.xs, value.ys));
  }

  function getValue(uint256 entity) public view returns (List memory) {
    (uint256[] memory addresses, uint256[] memory timestamps, uint256[] memory xs, uint256[] memory ys) = abi.decode(
      getRawValue(entity),
      (uint256[], uint256[], uint256[], uint256[])
    );
    return List(addresses, timestamps, xs, ys);
  }

  function getEntitiesWithValue(List calldata list) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(list));
  }
}
