import { defineComponentSystem, getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
import { NetworkLayer } from "../../network";
import { PhaserLayer } from "../types";

const SCALE = 300n;
const WIDTH = 1000000000000000000000000000000000000000000000000000000000000000000000000002n;
export const PRIME = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
const BIG = SCALE * 10n;
const ALSOBIG = 200n;
const RECT_DIMENSIONS = [
  [-ALSOBIG, 0, ALSOBIG, BIG],
  [-ALSOBIG, -ALSOBIG, BIG, ALSOBIG],
  [SCALE, 0, BIG, BIG],
  [0, SCALE, BIG, BIG],
];

const INSIDE_COLOR = 0xffffff;
const OUTSIDE_COLOR = 0x000000;
const IT_COLOR = 0xff715b;
const NOT_IT_COLOR = 0x1ea896;
const SELECTED_COLOR = 0x000000;
const NOT_SELECTED_COLOR = 0xcccccc;
const VECTOR_COLOR = 0x4c5454;

const convert = (n: bigint) => (n * SCALE) / PRIME;

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
        gameObject.setPosition(Number(v[0]), Number(v[1]));
        gameObject.setFillStyle(OUTSIDE_COLOR);
        gameObject.setSize(Number(v[2]), Number(v[3]));
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

    const w = Number(convert(WIDTH));

    [-1, 0, 1].map((x) =>
      [-1, 0, 1].map((y) => {
        const s = `Rectangle${x}${y}-${entity}`;
        const object = objectPool.get(s, "Rectangle");

        const unitScreen = {
          x: Number(convert(BigInt(unit.x) - BigInt(x) * PRIME)),
          y: Number(convert(BigInt(unit.y) - BigInt(y) * PRIME)),
        };

        object.setComponent({
          id: s,
          once: (gameObject) => {
            gameObject.setOrigin(0.5, 0.5);
            gameObject.setPosition(unitScreen.x, unitScreen.y);
            gameObject.setFillStyle(isIt && isIt.value ? IT_COLOR : NOT_IT_COLOR);
            gameObject.setDepth(200);

            if (index) {
              const indexWidth = (w * 2 * (Number(index.value) + 2)) / 3;
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
            gameObject.setFillStyle(isSelected && isSelected.value ? SELECTED_COLOR : NOT_SELECTED_COLOR);
            gameObject.setDepth(100);

            if (index) {
              const indexWidth = (w * 2 * (Number(index.value) + 2)) / 3 + 4;
              gameObject.setSize(indexWidth, indexWidth);
            }
          },
        });

        const vectorS = `Vector${x}${y}-${entity}`;
        objectPool.get(vectorS, "Rectangle").setComponent({
          id: vectorS,
          once: (gameObject) => {
            if (vector) {
              const x = unitScreen.x + Number(convert((BigInt(vector.x) * BigInt(speed?.value)) % PRIME));
              const y = unitScreen.y + Number(convert((BigInt(vector.y) * BigInt(speed?.value)) % PRIME));

              gameObject.setOrigin(0.5, 0.5);
              gameObject.setPosition(x, y);
              gameObject.setFillStyle(VECTOR_COLOR);
              gameObject.setSize(w / 2, w / 2);
              gameObject.setDepth(250);
            }
          },
        });

        const textS = `Text${x}${y}-${entity}`;
        objectPool.get(textS, "Text").setComponent({
          id: textS,
          once: (gameObject) => {
            if (index) {
              const indexProper = parseInt(index.value.toString());

              gameObject.setOrigin(0.5, 0.5);
              gameObject.setPosition(unitScreen.x, unitScreen.y);
              gameObject.setDepth(300);
              gameObject.setColor("white");
              gameObject.setText(indexProper.toString());
            }
          },
        });
      })
    );
  });
}
