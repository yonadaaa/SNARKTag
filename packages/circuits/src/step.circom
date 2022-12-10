pragma circom 2.1.2;

include "../../../node_modules/circomlib/circuits/bitify.circom";
include "../../../node_modules/circomlib/circuits/mux1.circom";
include "../../../node_modules/circomlib/circuits/gates.circom";

template Step(UNITS, D, BASE_RADIUS) {
    signal input position_in[UNITS][D];     // The current position of each unit
    signal input vector_in[UNITS][D];       // The direction vector for each unit
    signal output position_out[UNITS][D];
    signal output vector_out[UNITS][D];
     
    signal sums[UNITS][UNITS][D];
    signal potPositions[UNITS][D];
    signal collisions[UNITS][UNITS];
    signal collisionAccum[UNITS][UNITS];
    signal actual_vector[UNITS][D];
    signal vectorAccum[UNITS][UNITS][D];

    component mux[UNITS];
    component bits[UNITS][UNITS][D];
    component compPositive[UNITS][UNITS][D];
    component compNegative[UNITS][UNITS][D];
    component muxVector[UNITS][UNITS];
    component muxIt[UNITS][UNITS];
    component multiAND[UNITS][UNITS];
    component isCollision[UNITS][UNITS][D];

    var HALF_WIDTHS[UNITS];
    var MULTIPLIER[UNITS];

    // Movement phase
    for (var i=0; i < UNITS; i++) {
        HALF_WIDTHS[i] = ((i+2) * BASE_RADIUS) / 3;

        for (var j=0; j < D; j++) {
            actual_vector[i][j] <== vector_in[i][j];
            potPositions[i][j] <== position_in[i][j] + actual_vector[i][j];
        }
    }

    for (var i=0; i < UNITS; i++) {
        // Collision detection phase
        for (var j=0; j < UNITS; j++) {
            if (i < j) {
                multiAND[i][j] = MultiAND(D);
                
                var MAX_DISTANCE = HALF_WIDTHS[i] + HALF_WIDTHS[j];
                
                for (var k=0; k < D; k++) {
                    var diff = potPositions[i][k] - potPositions[j][k];
                    sums[i][j][k] <== (k == 0 ? 0 : sums[i][j][k-1]) + diff * diff;
                }

                collisions[i][j] <== LessThan(252)([sums[i][j][D-1], MAX_DISTANCE * MAX_DISTANCE]);
            } else {
                collisions[i][j] <== 0;
            }
        }

        // Collision resolution phase
        for (var j=0; j < UNITS; j++) {
            var isColliding = i < j ? collisions[i][j] : collisions[j][i];

            collisionAccum[i][j] <== OR()(j == 0 ? 0 : collisionAccum[i][j-1], isColliding);

            muxVector[i][j] = MultiMux1(D);
            muxVector[i][j].s <== isColliding;
            for (var k=0; k < D; k++) {
                muxVector[i][j].c[k][0] <== j == 0 ? vector_in[i][k] : muxVector[i][j-1].out[k];
                muxVector[i][j].c[k][1] <== vector_in[j][k];
            }
            vectorAccum[i][j] <== muxVector[i][j].out;
        }
        
        mux[i] = MultiMux1(D);
        mux[i].s <== collisionAccum[i][UNITS-1];
        for (var j=0; j < D; j++) {
            mux[i].c[j][0] <== potPositions[i][j];
            mux[i].c[j][1] <== position_in[i][j];
        }

        position_out[i] <== mux[i].out;
        vector_out[i] <== vectorAccum[i][UNITS-1];
    }
}
