import {
  defineComponentSystem,
  defineRxSystem,
  getComponentEntities,
  getComponentValue,
  getComponentValueStrict,
  setComponent,
} from "@latticexyz/recs";
import { timer } from "rxjs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../types";
import { transitionWitness, validateWitness } from "./zkProving";

export function createRateSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { Rate: Rate },
  } = network;

  defineComponentSystem(world, Rate, ({ value }) => {
    const rate = value[0];
    if (!rate) return console.warn("no rate");

    defineRxSystem(world, timer(0, rate.value), async () => {
      const lists = getComponentEntities(network.components.List);
      for (const entity of lists) {
        const highest = getComponentValue(phaser.components.Highest, entity);
        const list = getComponentValue(network.components.List, entity);
        const vectorValue = getComponentValueStrict(
          phaser.components.Vector,
          entity
        );

        if (!highest) {
          setComponent(phaser.components.Highest, entity, { value: 0 });
        }

        // Some things are being counted twice here
        if (highest && list) {
          for (let i = highest.value; i < list.addresses.length; i++) {
            const vector = {
              x: list.xs[i].toString(),
              y: list.ys[i].toString(),
            };

            const input = {
              vector_in: [vectorValue.x, vectorValue.y],
              thrust_in: [vector.x, vector.y],
            };

            const w = await validateWitness(input);

            setComponent(phaser.components.Vector, entity, {
              x: w[0],
              y: w[1],
            });
          }

          setComponent(phaser.components.Highest, entity, {
            value: list.addresses.length,
          });
        }
      }

      const units = getComponentEntities(phaser.components.Unit);

      const position_in = [
        ["0", "0"],
        ["0", "0"],
        ["0", "0"],
      ];
      const vector_in = [
        ["0", "0"],
        ["0", "0"],
        ["0", "0"],
      ];

      for (const entity of units) {
        const indexValue = getComponentValueStrict(
          network.components.Index,
          entity
        );
        const unitValue = getComponentValueStrict(
          phaser.components.Unit,
          entity
        );
        const vectorValue = getComponentValueStrict(
          phaser.components.Vector,
          entity
        );

        const indexProper = parseInt(indexValue.value.toString());

        position_in[indexProper] = [unitValue.x, unitValue.y];
        vector_in[indexProper] = [vectorValue.x, vectorValue.y];
      }

      const input = { position_in, vector_in };

      const w = await transitionWitness(input);

      const position_out = [0, 1, 2].map((i) => ({
        x: w[i * 2],
        y: w[i * 2 + 1],
      }));
      const vector_out = [3, 4, 5].map((i) => ({
        x: w[i * 2],
        y: w[i * 2 + 1],
      }));

      for (const entity of getComponentEntities(phaser.components.Unit)) {
        const index = getComponentValueStrict(network.components.Index, entity);
        const indexParsed = Number(index.value);

        setComponent(phaser.components.Unit, entity, position_out[indexParsed]);
        setComponent(phaser.components.Vector, entity, vector_out[indexParsed]);
      }
    });
  });
}
