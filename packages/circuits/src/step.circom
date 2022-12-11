pragma circom 2.1.2;

include "../../../node_modules/circomlib/circuits/bitify.circom";
include "../../../node_modules/circomlib/circuits/mux1.circom";
include "../../../node_modules/circomlib/circuits/gates.circom";
include "./divisionconstant.circom";

template Step(UNITS, D, BASE_RADIUS) {
    signal input position_in[UNITS][D];     // The current position of each unit
    signal input vector_in[UNITS][D];       // The direction vector for each unit
    signal output position_out[UNITS][D];
    signal output vector_out[UNITS][D];
     
    signal sums[UNITS][UNITS][D];
    signal collisions[UNITS][UNITS];
    signal vectorAccum[UNITS][UNITS][D];

    component muxVector[UNITS][UNITS];
    component multiAND[UNITS][UNITS];
    component isCollision[UNITS][UNITS][D];

    var HALF_WIDTHS[UNITS];
    var MASSES[UNITS];

    // Movement phase
    for (var i=0; i < UNITS; i++) {
        HALF_WIDTHS[i] = ((i+2) * BASE_RADIUS) / 3;
        MASSES[i] = i+1;

        for (var j=0; j < D; j++) {
            position_out[i][j] <== position_in[i][j] + vector_in[i][j];
        }
    }

    for (var i=0; i < UNITS; i++) {
        // Collision detection phase
        for (var j=0; j < UNITS; j++) {
            if (i < j) {
                multiAND[i][j] = MultiAND(D);
                
                var MAX_DISTANCE = HALF_WIDTHS[i] + HALF_WIDTHS[j];
                
                for (var k=0; k < D; k++) {
                    var diff = position_out[i][k] - position_out[j][k];
                    sums[i][j][k] <== (k == 0 ? 0 : sums[i][j][k-1]) + diff * diff;
                }

                // Max possible value is D*((2 ** 32) ** 2)
                collisions[i][j] <== LessThan(65)([sums[i][j][D-1], MAX_DISTANCE * MAX_DISTANCE]);
            } else {
                collisions[i][j] <== 0;
            }
        }

        // Collision resolution phase
        for (var j=0; j < UNITS; j++) {
            if (i == j) {
                vectorAccum[i][j] <== j == 0 ? vector_in[i] : vectorAccum[i][j-1];
            } else {
                var isColliding = i < j ? collisions[i][j] : collisions[j][i];

                // Elastic collision.
                // From https://en.wikipedia.org/wiki/Elastic_collision#One-dimensional_Newtonian
                var DIVISOR = MASSES[i] + MASSES[j];
                var numerator1 = MASSES[i] - MASSES[j];
                var numerator2 = 2 * MASSES[j];
                
                var v[D];
                for (var k=0; k < D; k++) {
                    var (remainder, quotient) = DivisionConstant(DIVISOR)(numerator1 * vector_in[i][k] + numerator2 * vector_in[j][k]);

                    v[k] = quotient;
                }

                muxVector[i][j] = MultiMux1(D);
                muxVector[i][j].s <== isColliding;
                for (var k=0; k < D; k++) {
                    muxVector[i][j].c[k][0] <== j == 0 ? vector_in[i][k] : vectorAccum[i][j-1][k];
                    muxVector[i][j].c[k][1] <== v[k];
                }

                vectorAccum[i][j] <== muxVector[i][j].out;
            }
        }
        
        vector_out[i] <== vectorAccum[i][UNITS-1];
    }
}