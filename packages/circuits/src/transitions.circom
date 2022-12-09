pragma circom 2.1.2;

include "./step.circom";

// Number of frames, number of units, dimensionality of universe, speed of unit, width of unit
template Transitions(F, UNITS, D, DECAY, WIDTH) {
    signal input position_in[UNITS][D];     // The current position of each unit
    signal input vector_in[UNITS][D];       // The speed of each unit
    signal input speed_in[UNITS];           // The direction vector for each unit
    signal input it_in;                     // Who is currently "it"
    signal output position_out[UNITS][D];
    signal output vector_out[UNITS][D];
    signal output speed_out[UNITS];
    signal output it_out;
    
    signal positions[F][UNITS][D];
    signal vectors[F][UNITS][D];
    signal speeds[F][UNITS];
    signal its[F];
    
    for (var i=0; i < F; i++) {
        if (i == 0) {
            (positions[i], vectors[i], speeds[i], its[i]) <== Step(UNITS, D, DECAY, WIDTH)(position_in, vector_in, speed_in, it_in);
        } else {
            (positions[i], vectors[i], speeds[i], its[i]) <== Step(UNITS, D, DECAY, WIDTH)(positions[i-1], vectors[i-1], speeds[i-1], its[i-1]);
        }
    }

    position_out <== positions[F-1];
    vector_out <== vectors[F-1];
    speed_out <== speeds[F-1];
    it_out <== its[F-1];
}

component main { public [ position_in, vector_in, speed_in, it_in ] } = Transitions(10, 3, 2, 1000000000000000000000000000000000000000000000000000000000000000000000, 1000000000000000000000000000000000000000000000000000000000000000000000000002);