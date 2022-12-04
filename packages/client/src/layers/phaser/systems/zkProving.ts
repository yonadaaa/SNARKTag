import { BigNumberish } from "ethers";

type ProofType = unknown;

type SnarkJs = {
  groth16: {
    fullProve(
      input: Record<string, BigNumberish | BigNumberish[]>,
      circuitWasmPath: string,
      circuitZKeyPath: string
    ): Promise<{ proof: ProofType; publicSignals: string[] }>;
    exportSolidityCallData(proof: ProofType, publicSignals: string[]): Promise<string>;
  };
  wtns: {
    calculate(
      _input: Record<string, BigNumberish | BigNumberish[]>,
      wasmFileName: string,
      wtnsFileName: {
        type: string;
      }
    ): any;
    exportJson(wtnsFileName: { type: string }): Array<bigint>;
  };
};

function createWitness<InputType extends Record<keyof InputType, string | string[]>>(circuitName: string) {
  const snarkjs = (window as unknown as { snarkjs: SnarkJs }).snarkjs;

  return async (input: InputType) => {
    const wtns = {
      type: "mem",
    };

    const start = Date.now();
    await snarkjs.wtns.calculate(input, `/circuits/${circuitName}/circuit.wasm`, wtns);
    const w = (await snarkjs.wtns.exportJson(wtns)).slice(1).map((n) => n.toString());

    console.log(`Witness generated for ${circuitName}, took ${(Date.now() - start) / 1000}s`);

    return w;
  };
}

function createProver<InputType extends Record<keyof InputType, string | string[]>>(circuitName: string) {
  const snarkjs = (window as unknown as { snarkjs: SnarkJs }).snarkjs;

  return async (input: InputType) => {
    const start = Date.now();
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      `/circuits/${circuitName}/circuit.wasm`,
      `/circuits/${circuitName}/circuit_final.zkey`
    );
    console.log(`Proof generated for ${circuitName}, took ${(Date.now() - start) / 1000}s`);

    // Adds an outer array to the params string returned from exportSolidityCallData, flattens the
    // parsed nested array structure, removes the public signal values from the end (unneeded)
    const proofData: string[] = JSON.parse(`[${await snarkjs.groth16.exportSolidityCallData(proof, publicSignals)}]`)
      .flat(2)
      .slice(0, -publicSignals.length);

    return { proofData, publicSignals };
  };
}

type TransitionProofInput = { position_in: Array<Array<string>>; vector_in: Array<Array<string>>, speed_in: Array<string>, it_in: string };
export const transitionWitness = createWitness<TransitionProofInput>("transition");
export const transitionsProver = createProver<TransitionProofInput>("transitions");

type ValidateProofInput = { speed_in: string; vector_in: Array<string> };
export const validateWitness = createWitness<ValidateProofInput>("validate");
