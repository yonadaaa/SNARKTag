import { defineComponent, Metadata, Type, World } from "@latticexyz/recs";

export function defineFieldCoordComponent<M extends Metadata>(
  world: World,
  options?: { id?: string; metadata?: M; indexed?: boolean }
) {
  return defineComponent<{ x: Type.String; y: Type.String }, M>(
    world,
    { x: Type.String, y: Type.String },
    options
  );
}
