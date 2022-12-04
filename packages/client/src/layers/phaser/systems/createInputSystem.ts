import { getComponentEntities, getComponentValue, getComponentValueStrict, setComponent } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../types";
import { PRIME } from "./createUnitSystem";

// TODO: arrange these into x, y pairs
export const HYPOTENUSE = 841n;
export const A = 580n;
export const B = 609n;
const PAIR0 = { x: HYPOTENUSE, y: 0 };
const PAIR1 = { x: 0, y: HYPOTENUSE };
const PAIR2 = { x: PAIR1.x, y: PRIME - HYPOTENUSE };
const PAIR3 = { x: PRIME - HYPOTENUSE, y: PAIR0.y };
const PAIR7 = {
  x: 580n,
  y: 609n,
};
const PAIR8 = {
  x: 840n,
  y: 41n,
};
const PAIR4 = { x: PRIME - A, y: PAIR7.y };
const PAIR5 = { x: PAIR7.x, y: PRIME - B };
const PAIR9 = { x: PRIME - A, y: PRIME - B };

// TODO: find a way to interpolate between these for UX
const UNIT_VECTORS = {
  s: PAIR1,
  d: PAIR0,
  w: PAIR2,
  a: PAIR3,
  x: PAIR7,
  z: PAIR4,
  e: PAIR5,
  q: PAIR9,
  r: PAIR8,
};

export function createInputSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    scenes: {
      Main: { input },
    },
  } = phaser;

  const keySub = input.keyboard$.subscribe((p) => {
    if (p.isUp) {
      if (p.originalEvent.key === "c") {
        network.api.create();
      }
      if (p.originalEvent.key === "p") {
        network.api.prove();
      }

      const unitVector = UNIT_VECTORS[p.originalEvent.key];

      if (unitVector) {
        const selecteds = getComponentEntities(phaser.components.Selected);
        for (const selected of selecteds) {
          const selectedValue = getComponentValueStrict(phaser.components.Selected, selected);
          const index = getComponentValueStrict(network.components.Index, selected);
          if (selectedValue.value) {
            network.api.move(index.value, unitVector);
          }
        }
      }

      const entityIndex = parseInt(p.originalEvent.key);
      let found = false;
      for (const sel of getComponentEntities(phaser.components.Selected)) {
        const unitValue = getComponentValue(phaser.components.Selected, sel);
        const index = getComponentValueStrict(network.components.Index, sel);

        if (unitValue && index.value == entityIndex) {
          found = true;
          break;
        }
      }

      for (const sel of getComponentEntities(phaser.components.Selected)) {
        const unitValue = getComponentValue(phaser.components.Selected, sel);
        const index = getComponentValueStrict(network.components.Index, sel);
        if (found) {
          setComponent(phaser.components.Selected, sel, { value: false });
        }

        if (unitValue && index.value == entityIndex) {
          setComponent(phaser.components.Selected, sel, { value: true });
        }
      }
    }
  });

  world.registerDisposer(() => {
    keySub?.unsubscribe();
  });
}
