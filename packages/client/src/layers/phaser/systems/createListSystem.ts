import { defineComponentSystem, getComponentValueStrict, setComponent } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../types";
import { validateWitness } from "./zkProving";

export function createListSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { List: List },
  } = network;

  defineComponentSystem(world, List, async ({ entity, value }) => {
    const list = value[0];
    if (!list) return console.warn("no position");

    if (list.xs.length > 0) {
      const vector = {
        x: list.xs[list.xs.length - 1].toString(),
        y: list.ys[list.ys.length - 1].toString(),
      };

      const speedValue = getComponentValueStrict(phaser.components.Speed, entity);

      const input = {
        vector_in: [vector.x, vector.y],
        speed_in: speedValue.value,
      };

      const w = await validateWitness(input);

      setComponent(phaser.components.Vector, entity, vector);
      setComponent(phaser.components.Speed, entity, { value: w[0] });
    }
  });
}
