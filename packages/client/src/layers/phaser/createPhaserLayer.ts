import { namespaceWorld } from "@latticexyz/recs";
import { createPhaserEngine } from "@latticexyz/phaserx";
import { phaserConfig } from "./config";
import { NetworkLayer } from "../network";
import { createListSystem, createInputSystem } from "./systems";
import { defineBoolComponent, defineNumberComponent, defineStringComponent } from "@latticexyz/std-client";
import { createUnitSystem } from "./systems/createUnitSystem";
import { createPositionSystem } from "./systems/createPositionSystem";
import { createRateSystem } from "./systems/createRateSystem";
import { defineFieldCoordComponent } from "../network/components/FieldCoordComponent";
import { createDirectionSystem } from "./systems/createDirectionSystem";
import { createSpeedSystem } from "./systems/createSpeedSystem";
import { createItSystem } from "./systems/createItSystem";

/**
 * The Phaser layer is responsible for rendering game objects to the screen.
 */
export async function createPhaserLayer(network: NetworkLayer) {
  // --- WORLD ----------------------------------------------------------------------
  const world = namespaceWorld(network.world, "phaser");

  // --- COMPONENTS -----------------------------------------------------------------
  const components = {
    Speed: defineStringComponent(world, { id: "Speed" }),
    Unit: defineFieldCoordComponent(world, { id: "Unit" }),
    Vector: defineFieldCoordComponent(world, { id: "Vector" }),
    Selected: defineBoolComponent(world, { id: "Selected" }),
    ItClient: defineBoolComponent(world, { id: "ItClient" }),
  };

  // --- PHASER ENGINE SETUP --------------------------------------------------------
  const { game, scenes, dispose: disposePhaser } = await createPhaserEngine(phaserConfig);
  world.registerDisposer(disposePhaser);

  // --- LAYER CONTEXT --------------------------------------------------------------
  const context = {
    world,
    components,
    network,
    game,
    scenes,
  };

  // --- SYSTEMS --------------------------------------------------------------------
  createRateSystem(network, context);
  createSpeedSystem(network, context);
  createPositionSystem(network, context);
  createDirectionSystem(network, context);
  createListSystem(network, context);
  createItSystem(network, context);
  createUnitSystem(network, context);
  createInputSystem(network, context);

  return context;
}
