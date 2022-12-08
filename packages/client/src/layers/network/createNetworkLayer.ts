import {
  createWorld,
  EntityID,
  EntityIndex,
  getComponentEntities,
  getComponentValueStrict,
} from "@latticexyz/recs";
import { setupDevSystems } from "./setup";
import {
  createActionSystem,
  setupMUDNetwork,
  defineNumberComponent,
  defineBoolComponent,
  defineStringComponent,
} from "@latticexyz/std-client";
import { defineLoadingStateComponent } from "./components";
import { SystemTypes } from "contracts/types/SystemTypes";
import { SystemAbis } from "contracts/types/SystemAbis.mjs";
import { GameConfig, getNetworkConfig } from "./config";
import { Coord } from "@latticexyz/utils";
import { transitionsProver } from "../phaser/systems/zkProving";
import { HYPOTENUSE } from "../phaser/systems/createInputSystem";
import { defineFieldCoordComponent } from "./components/FieldCoordComponent";
import { defineListComponent } from "./components/ListComponent";

const UNITS = 3;

/**
 * The Network layer is the lowest layer in the client architecture.
 * Its purpose is to synchronize the client components with the contract components.
 */
export async function createNetworkLayer(config: GameConfig) {
  console.log("Network config", config);

  // --- WORLD ----------------------------------------------------------------------
  const world = createWorld();

  // --- COMPONENTS -----------------------------------------------------------------
  const components = {
    LoadingState: defineLoadingStateComponent(world),
    List: defineListComponent(world, {
      id: "List",
      metadata: { contractId: "component.List" },
    }),
    Index: defineNumberComponent(world, {
      id: "Index",
      metadata: { contractId: "component.Index" },
    }),
    It: defineBoolComponent(world, {
      id: "It",
      metadata: { contractId: "component.It" },
    }),
    Owner: defineStringComponent(world, {
      id: "Owner",
      metadata: { contractId: "component.Owner" },
    }),
    Position: defineFieldCoordComponent(world, {
      id: "Position",
      metadata: { contractId: "component.Position" },
    }),
    Pace: defineStringComponent(world, {
      id: "Pace",
      metadata: { contractId: "component.Speed" },
    }),
    Direction: defineFieldCoordComponent(world, {
      id: "Direction",
      metadata: { contractId: "component.Vector" },
    }),
    Created: defineBoolComponent(world, {
      id: "Created",
      metadata: { contractId: "component.Created" },
    }),
    Rate: defineNumberComponent(world, {
      id: "Rate",
      metadata: { contractId: "component.Rate" },
    }),
    Start: defineNumberComponent(world, {
      id: "Start",
      metadata: { contractId: "component.Start" },
    }),
  };

  // --- SETUP ----------------------------------------------------------------------
  const { txQueue, systems, txReduced$, network, startSync, encoders } =
    await setupMUDNetwork<typeof components, SystemTypes>(
      getNetworkConfig(config),
      world,
      components,
      SystemAbis
    );

  // --- ACTION SYSTEM --------------------------------------------------------------
  const actions = createActionSystem(world, txReduced$);

  // --- API ------------------------------------------------------------------------
  function create() {
    systems["system.Create"].executeTyped(100);
  }
  function move(unit: number, coord: Coord) {
    systems["system.Bulletin"].executeTyped(unit, coord.x, coord.y);
  }
  async function prove() {
    const entities = getComponentEntities(components.Position);
    const position_in = [];
    for (const e of entities) {
      const position = getComponentValueStrict(components.Position, e);
      position_in.push([position.x, position.y]);
    }
    const vector_in = Array(UNITS).fill([HYPOTENUSE.toString(), 0]);

    const input = {
      position_in,
      vector_in,
      speed_in: ["0", "0", "0"],
      it_in: "0",
    };

    const { proofData, publicSignals } = await transitionsProver(input);

    const position_out = [...Array(UNITS).keys()].map((i) => ({
      x: publicSignals[i * 2],
      y: publicSignals[i * 2 + 1],
    }));

    systems["system.Client"].executeTyped(proofData, position_out);
  }

  // --- CONTEXT --------------------------------------------------------------------
  const context = {
    world,
    components,
    txQueue,
    systems,
    txReduced$,
    startSync,
    network,
    actions,
    api: { create, move, prove },
    dev: setupDevSystems(world, encoders, systems),
  };

  return context;
}
