import { defineComponent, Metadata, Type, World } from "@latticexyz/recs";

export function defineListComponent<M extends Metadata>(
  world: World,
  options?: { id?: string; metadata?: M; indexed?: boolean }
) {
  return defineComponent<
    {
      addresses: Type.NumberArray;
      timestamps: Type.NumberArray;
      xs: Type.NumberArray;
      ys: Type.NumberArray;
    },
    M
  >(
    world,
    {
      addresses: Type.NumberArray,
      timestamps: Type.NumberArray,
      xs: Type.NumberArray,
      ys: Type.NumberArray,
    },
    options
  );
}
