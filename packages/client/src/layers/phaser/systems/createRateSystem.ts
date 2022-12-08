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

// Every tick, check for new events, and apply them.
// That will stop our async problem.
// have an index indicating which you've processed.
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

        if (!highest) {
          setComponent(phaser.components.Highest, entity, { value: 0 });
        }

        if (highest && list) {
          for (let i = 0; i < list.addresses.length; i++) {
            if (i > highest.value) {
              setComponent(phaser.components.Highest, entity, { value: i });

              const vector = {
                x: list.xs[i].toString(),
                y: list.ys[i].toString(),
              };

              const speedValue = getComponentValueStrict(
                phaser.components.Speed,
                entity
              );

              const input = {
                vector_in: [vector.x, vector.y],
                speed_in: speedValue.value,
              };

              const w = await validateWitness(input);

              setComponent(phaser.components.Vector, entity, vector);
              setComponent(phaser.components.Speed, entity, { value: w[0] });
            }
          }
        }

        console.log(getComponentValue(phaser.components.Highest, entity));
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
      const speed_in = ["0", "0", "0"];
      let it_in = 0;

      for (const entity of units) {
        const indexValue = getComponentValueStrict(
          network.components.Index,
          entity
        );
        const itValue = getComponentValueStrict(
          phaser.components.ItClient,
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
        const speedValue = getComponentValueStrict(
          phaser.components.Speed,
          entity
        );

        const indexProper = parseInt(indexValue.value.toString());

        position_in[indexProper] = [unitValue.x, unitValue.y];
        vector_in[indexProper] = [vectorValue.x, vectorValue.y];
        speed_in[indexProper] = speedValue.value;

        if (itValue.value) {
          it_in = Number(indexValue.value);
        }
      }

      const input = { position_in, vector_in, speed_in, it_in };

      const w = await transitionWitness(input);

      const position_out = [0, 1, 2].map((i) => ({
        x: w[i * 2],
        y: w[i * 2 + 1],
      }));
      const vector_out = [3, 4, 5].map((i) => ({
        x: w[i * 2],
        y: w[i * 2 + 1],
      }));
      const speed_out = [12, 13, 14].map((i) => w[i].toString());
      const it_out = w[15].toString();

      for (const entity of getComponentEntities(phaser.components.Unit)) {
        const index = getComponentValueStrict(network.components.Index, entity);
        const indexParsed = Number(index.value);

        setComponent(phaser.components.Unit, entity, position_out[indexParsed]);
        setComponent(phaser.components.Vector, entity, vector_out[indexParsed]);
        setComponent(phaser.components.Speed, entity, {
          value: speed_out[indexParsed],
        });
        setComponent(phaser.components.ItClient, entity, {
          value: indexParsed === Number(it_out),
        });
      }
    });
  });
}
