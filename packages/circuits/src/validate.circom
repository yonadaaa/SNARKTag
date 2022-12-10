pragma circom 2.1.2;

// Checks that a given vector corresponds to a Pythagorean (n)tuple
template Validate(D, HYPOTENUSE) {
    signal input vector_in[D];
    signal input thrust_in[D];
    signal output vector_out[D];
    signal sum[D];

    for (var i=0; i < D; i++) {
        sum[i] <== (i==0 ? 0 : sum[i-1]) + thrust_in[i] * thrust_in[i];
        vector_out[i] <== vector_in[i] + thrust_in[i];
    }

    sum[D-1] === HYPOTENUSE * HYPOTENUSE;
}

component main = Validate(2, 841);