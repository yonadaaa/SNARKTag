import { defineComponentSystem, getComponentValue, setComponent } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../types";

export function createDirectionSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { Direction: Direction },
  } = network;

  defineComponentSystem(world, Direction, ({ entity, value }) => {
    const vector = value[0];
    if (!vector) return console.warn("no position");

    if (!getComponentValue(phaser.components.Vector, entity)) {
      setComponent(phaser.components.Vector, entity, vector);
    }
  });
}
