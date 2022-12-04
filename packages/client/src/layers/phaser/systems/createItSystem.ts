import { defineComponentSystem, setComponent } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../types";

export function createItSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { It: It },
  } = network;

  defineComponentSystem(world, It, ({ entity, value }) => {
    const it = value[0];
    if (!it) return console.warn("no position");

    setComponent(phaser.components.ItClient, entity, it);
  });
}
