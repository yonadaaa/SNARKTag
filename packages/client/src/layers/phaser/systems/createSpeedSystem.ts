import { defineComponentSystem, getComponentValue, setComponent } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../types";

export function createSpeedSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { Pace: Pace },
  } = network;

  defineComponentSystem(world, Pace, ({ entity, value }) => {
    const speed = value[0];
    if (!speed) return console.warn("no position");

    setComponent(phaser.components.Speed, entity, speed);
  });
}
