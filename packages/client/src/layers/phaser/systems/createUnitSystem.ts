import {
  defineComponentSystem,
  getComponentValue,
  getComponentValueStrict,
} from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../types";

const SCALE = 300;
const BIGINT_SCALE = BigInt(SCALE);
const BASE_HALF_WIDTH =
  1000000000000000000000000000000000000000000000000000000000000000000000000002n;
export const PRIME =
  21888242871839275222246405745257275088548364400416034343698204186575808495617n;
const RECT_LONG = SCALE * 10;
const RECT_SHORT = SCALE * 0.6;
const RECT_DIMENSIONS = [
  [-RECT_SHORT, 0, RECT_SHORT, RECT_LONG],
  [-RECT_SHORT, -RECT_SHORT, RECT_LONG, RECT_SHORT],
  [SCALE, 0, RECT_LONG, RECT_LONG],
  [0, SCALE, RECT_LONG, RECT_LONG],
];

const INSIDE_COLOR = 0xffffff;
const OUTSIDE_COLOR = 0x000000;
const IT_COLOR = 0xff715b;
const NOT_IT_COLOR = 0x1ea896;
const SELECTED_COLOR = 0x000000;
const NOT_SELECTED_COLOR = 0xcccccc;
const VECTOR_COLOR = 0x4c5454;

const convert = (n: bigint) => Number((BIGINT_SCALE * n) / PRIME);

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
      gameObject.setSize(1000, 1000);
    },
  });

  RECT_DIMENSIONS.map((v, i) => {
    const lineObject = objectPool.get(`Line-${i}`, "Rectangle");
    lineObject.setComponent({
      id: `Line-${i}`,
      once: (gameObject) => {
        gameObject.setPosition(v[0], v[1]);
        gameObject.setFillStyle(OUTSIDE_COLOR);
        gameObject.setSize(v[2], v[3]);
        gameObject.setDepth(1000);
      },
    });
  });

  defineComponentSystem(world, Unit, ({ entity, value }) => {
    const unit = value[0];
    if (!unit) return console.warn("no position");

    const isSelected = getComponentValue(phaser.components.Selected, entity);
    const isIt = getComponentValue(phaser.components.ItClient, entity);
    const vector = getComponentValue(phaser.components.Vector, entity);
    const speed = getComponentValueStrict(phaser.components.Speed, entity);
    const index = getComponentValue(network.components.Index, entity);

    const halfWidthScreen = convert(BASE_HALF_WIDTH);

    [-PRIME, 0, PRIME].map((x) =>
      [-PRIME, 0, PRIME].map((y) => {
        const s = `Rectangle${x}${y}-${entity}`;
        const object = objectPool.get(s, "Rectangle");

        const unitScreen = {
          x: convert(BigInt(unit.x) - BigInt(x)),
          y: convert(BigInt(unit.y) - BigInt(y)),
        };

        object.setComponent({
          id: s,
          once: (gameObject) => {
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setPosition(unitScreen.x, unitScreen.y);
            gameObject.setFillStyle(
              isIt && isIt.value ? IT_COLOR : NOT_IT_COLOR
            );
            gameObject.setDepth(200);

            if (index) {
              const indexWidth =
                (halfWidthScreen * 2 * (Number(index.value) + 2)) / 3;
              gameObject.setSize(indexWidth, indexWidth);
            }
          },
        });

        const borderS = `Border${x}${y}-${entity}`;
        objectPool.get(borderS, "Rectangle").setComponent({
          id: borderS,
          once: (gameObject) => {
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setPosition(unitScreen.x, unitScreen.y);
            gameObject.setFillStyle(
              isSelected && isSelected.value
                ? SELECTED_COLOR
                : NOT_SELECTED_COLOR
            );
            gameObject.setDepth(100);

            if (index) {
              const indexWidth =
                (halfWidthScreen * 2 * (Number(index.value) + 2)) / 3 + 4;
              gameObject.setSize(indexWidth, indexWidth);
            }
          },
        });

        const vectorS = `Vector${x}${y}-${entity}`;
        objectPool.get(vectorS, "Rectangle").setComponent({
          id: vectorS,
          once: (gameObject) => {
            if (vector && speed) {
              const x =
                unitScreen.x +
                convert((BigInt(vector.x) * BigInt(speed.value)) % PRIME);
              const y =
                unitScreen.y +
                convert((BigInt(vector.y) * BigInt(speed.value)) % PRIME);

              gameObject.setPosition(x, y);
            }

            gameObject.setOrigin(0.5, 0.5);
            gameObject.setFillStyle(VECTOR_COLOR);
            gameObject.setSize(halfWidthScreen / 2, halfWidthScreen / 2);
            gameObject.setDepth(250);
          },
        });

        const textS = `Text${x}${y}-${entity}`;
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
      })
    );
  });
}
