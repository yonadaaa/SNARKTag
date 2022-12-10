import { defineComponentSystem, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../types";

const SCALE = 300;
const BIGINT_SCALE = BigInt(SCALE);
const BASE_HALF_WIDTH = 9000n;
export const PRIME =
  21888242871839275222246405745257275088548364400416034343698204186575808495617n;
export const RANGE = 200000n; // TODO: range needs to handle shifts. subtract the shift from unit.x
const ORIGIN = 2147483648n;

const INSIDE_COLOR = 0xffffff;
const SQUARE_COLOR = 0x1ea896;
const SELECTED_COLOR = 0x000000;
const NOT_SELECTED_COLOR = 0xcccccc;
const VECTOR_COLOR = 0x4c5454;

const convert = (n: bigint) => Number((BIGINT_SCALE * n) / RANGE);

export function createUnitSystem(network: NetworkLayer, phaser: PhaserLayer) {
  const {
    world,
    components: { Unit },
  } = phaser;

  const {
    scenes: {
      Main: { objectPool },
    },
  } = phaser;

  const backS = `Background`;
  objectPool.get(backS, "Rectangle").setComponent({
    id: backS,
    once: (gameObject) => {
      gameObject.setPosition(0, 0);
      gameObject.setFillStyle(INSIDE_COLOR);
      gameObject.setSize(10, 10);
    },
  });

  defineComponentSystem(world, Unit, ({ entity, value }) => {
    const unit = value[0];
    if (!unit) return console.warn("no position");

    const isSelected = getComponentValue(phaser.components.Selected, entity);
    const vector = getComponentValue(phaser.components.Vector, entity);
    const index = getComponentValue(network.components.Index, entity);

    const halfWidthScreen = convert(BASE_HALF_WIDTH);

    const s = `Rectangle-${entity}`;
    const object = objectPool.get(s, "Rectangle");

    const unitScreen = {
      x: convert(BigInt(unit.x) - ORIGIN),
      y: convert(BigInt(unit.y) - ORIGIN),
    };

    object.setComponent({
      id: s,
      once: (gameObject) => {
        gameObject.setOrigin(0.5, 0.5);
        gameObject.setPosition(unitScreen.x, unitScreen.y);
        gameObject.setFillStyle(SQUARE_COLOR);
        gameObject.setDepth(200);

        if (index) {
          const indexWidth =
            (halfWidthScreen * 2 * (Number(index.value) + 2)) / 3;
          gameObject.setSize(indexWidth, indexWidth);
        }
      },
    });

    const borderS = `Border-${entity}`;
    objectPool.get(borderS, "Rectangle").setComponent({
      id: borderS,
      once: (gameObject) => {
        gameObject.setOrigin(0.5, 0.5);
        gameObject.setPosition(unitScreen.x, unitScreen.y);
        gameObject.setFillStyle(
          isSelected && isSelected.value ? SELECTED_COLOR : NOT_SELECTED_COLOR
        );
        gameObject.setDepth(100);

        if (index) {
          const indexWidth =
            (halfWidthScreen * 2 * (Number(index.value) + 2)) / 3 + 4;
          gameObject.setSize(indexWidth, indexWidth);
        }
      },
    });

    const vectorXS = `VectorX${entity}`;
    objectPool.get(vectorXS, "Rectangle").setComponent({
      id: vectorXS,
      once: (gameObject) => {
        if (vector) {
          const ya = BigInt(vector.x);
          const x = unitScreen.x + convert(ya < PRIME / 2n ? ya : ya - PRIME);
          const y = unitScreen.y;

          gameObject.setPosition(x, y);
        }

        gameObject.setOrigin(0.5, 0.5);
        gameObject.setFillStyle(VECTOR_COLOR);
        gameObject.setSize(halfWidthScreen / 2, halfWidthScreen / 2);
        gameObject.setDepth(250);
      },
    });

    const vectorYS = `VectorY-${entity}`;
    objectPool.get(vectorYS, "Rectangle").setComponent({
      id: vectorYS,
      once: (gameObject) => {
        if (vector) {
          const ya = BigInt(vector.y);

          const x = unitScreen.x;
          const y = unitScreen.y + convert(ya < PRIME / 2n ? ya : ya - PRIME);

          gameObject.setPosition(x, y);
        }

        gameObject.setOrigin(0.5, 0.5);
        gameObject.setFillStyle(VECTOR_COLOR);
        gameObject.setSize(halfWidthScreen / 2, halfWidthScreen / 2);
        gameObject.setDepth(250);
      },
    });

    const textS = `Text-${entity}`;
    objectPool.get(textS, "Text").setComponent({
      id: textS,
      once: (gameObject) => {
        if (index) {
          const indexProper = parseInt(index.value.toString());
          gameObject.setText(indexProper.toString());
        }

        gameObject.setOrigin(0.5, 0.5);
        gameObject.setPosition(unitScreen.x, unitScreen.y);
        gameObject.setDepth(300);
        gameObject.setColor("white");
      },
    });
  });
}
