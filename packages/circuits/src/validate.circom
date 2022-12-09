pragma circom 2.1.2;

// Checks that a given vector corresponds to a Pythagorean (n)tuple
template Validate(D, HYPOTENUSE) {
    signal input speed_in;
    signal input vector_in[D];
    signal sum[D];

    for (var i=0; i < D; i++) {
        sum[i] <== (i==0 ? 0 : sum[i-1]) + vector_in[i] * vector_in[i];
    }

    sum[D-1] === HYPOTENUSE * HYPOTENUSE;
    
    // You should be able to combine vectors
    // You could just add them, now we don't have the speed abstraction
    signal output speed_out <== speed_in + 100000000000000000000000000000000000000000000000000000000000000000000000;
    signal output vector_out[D] <== vector_in;
}

component main { public [ vector_in ] } = Validate(2, 841);