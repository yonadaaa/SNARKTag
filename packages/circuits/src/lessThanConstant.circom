pragma circom 2.1.2;

include "../../../node_modules/circomlib/circuits/bitify.circom";

template LessThanConstant(WIDTH) {
    signal input in;
    signal output out;

    component comp = CompConstant(WIDTH);
    comp.in <== Num2Bits(254)(in);

    out <== (1 - comp.out);
}