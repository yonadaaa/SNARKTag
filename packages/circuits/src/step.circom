pragma circom 2.1.2;

include "../../../node_modules/circomlib/circuits/bitify.circom";
include "../../../node_modules/circomlib/circuits/mux1.circom";
include "../../../node_modules/circomlib/circuits/gates.circom";

template Step(UNITS, D, DECAY, WIDTH) {
    signal input position_in[UNITS][D];     // The current position of each unit
    signal input vector_in[UNITS][D];       // The direction vector for each unit
    signal input speed_in[UNITS];           // The speed of each unit
    signal input it_in;                     // Who is currently "it"
    signal output position_out[UNITS][D];
    signal output vector_out[UNITS][D];
    signal output speed_out[UNITS];
    signal output it_out;
     
    signal speed_temp[UNITS];
    signal potPositions[UNITS][D];
    signal collisions[UNITS][UNITS];
    signal collisionAccum[UNITS][UNITS];
    signal speedAccum[UNITS][UNITS];
    signal actual_vector[UNITS][D];
    signal vectorAccum[UNITS][UNITS][D];

    component mux[UNITS];
    component bits[UNITS][UNITS][D];
    component compPositive[UNITS][UNITS][D];
    component compNegative[UNITS][UNITS][D];
    component isEqual[UNITS][UNITS];
    component muxVector[UNITS][UNITS];
    component muxSpeed[UNITS][UNITS];
    component muxIt[UNITS][UNITS];
    component multiAND[UNITS][UNITS];
    component isCollision[UNITS][UNITS][D];

    var HALF_WIDTHS[UNITS];
    var MULTIPLIER[UNITS];

    // Movement phase
    for (var i=0; i < UNITS; i++) {
        HALF_WIDTHS[i] = ((i+2) * WIDTH) / 3;
        MULTIPLIER[i] = UNITS - i;

        var unitSpeed = speed_in[i] * MULTIPLIER[i];
        var isZero = IsZero()(speed_in[i]);
        var isNotZero = NOT()(isZero);

        speed_temp[i] <== isNotZero * (speed_in[i] - DECAY);

        for (var j=0; j < D; j++) {
            actual_vector[i][j] <== vector_in[i][j] * unitSpeed;
            potPositions[i][j] <== position_in[i][j] + actual_vector[i][j];
        }
    }

    // Collision phase
    for (var i=0; i < UNITS; i++) {
        for (var j=0; j < UNITS; j++) {
            if (i < j) {
                multiAND[i][j] = MultiAND(D);
                
                var MAX_DISTANCE = HALF_WIDTHS[i] + HALF_WIDTHS[j];

                for (var k=0; k < D; k++) {
                    // This difference can be postive or negative, so check both options
                    bits[i][j][k] = Num2Bits(254);
                    bits[i][j][k].in <== potPositions[i][k] - potPositions[j][k];

                    compPositive[i][j][k] = CompConstant(MAX_DISTANCE);
                    compPositive[i][j][k].in <== bits[i][j][k].out;

                    compNegative[i][j][k] = CompConstant(-MAX_DISTANCE);
                    compNegative[i][j][k].in <== bits[i][j][k].out;

                    isCollision[i][j][k] = OR();
                    isCollision[i][j][k].a <== NOT()(compPositive[i][j][k].out);
                    isCollision[i][j][k].b <== compNegative[i][j][k].out;

                    multiAND[i][j].in[k] <== isCollision[i][j][k].out;
                }

                collisions[i][j] <== multiAND[i][j].out;
            } else {
                collisions[i][j] <== 0;
            }
        }

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

            muxSpeed[i][j] = Mux1();
            muxSpeed[i][j].s <== isColliding;
            muxSpeed[i][j].c[0] <== j == 0 ? speed_temp[i] : muxSpeed[i][j-1].out;
            muxSpeed[i][j].c[1] <== speed_temp[j];

            speedAccum[i][j] <== muxSpeed[i][j].out;

            isEqual[i][j] = IsEqual();
            isEqual[i][j].in[0] <== j;
            isEqual[i][j].in[1] <== it_in;

            muxIt[i][j] = Mux1();
            muxIt[i][j].s <== AND()(isColliding, isEqual[i][j].out);
            muxIt[i][j].c[0] <== i == 0 && j == 0 ? it_in : (j == 0 ? muxIt[i-1][UNITS-1].out : muxIt[i][j-1].out);
            muxIt[i][j].c[1] <== i;
        }
        
        mux[i] = MultiMux1(D);
        mux[i].s <== collisionAccum[i][UNITS-1];
        for (var j=0; j < D; j++) {
            mux[i].c[j][0] <== potPositions[i][j];
            mux[i].c[j][1] <== position_in[i][j];
        }

        position_out[i] <== mux[i].out;
        speed_out[i] <== speedAccum[i][UNITS-1];
        vector_out[i] <== vectorAccum[i][UNITS-1];
    }

    it_out <== muxIt[UNITS-1][UNITS-1].out;
}
