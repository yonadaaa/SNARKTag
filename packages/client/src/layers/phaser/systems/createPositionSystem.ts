import {
  defineComponentSystem,
  getComponentValue,
  setComponent,
} from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../types";

export function createPositionSystem(
  network: NetworkLayer,
  phaser: PhaserLayer
) {
  const {
    world,
    components: { Position: Position },
  } = network;

  defineComponentSystem(world, Position, ({ entity, value }) => {
    const position = value[0];
    if (!position) return console.warn("no position");

    if (!getComponentValue(phaser.components.Unit, entity)) {
      setComponent(phaser.components.Unit, entity, position);
      setComponent(phaser.components.Selected, entity, { value: false });
    }
  });
}
