pragma circom 2.1.2;

include "../../../node_modules/circomlib/circuits/bitify.circom";
include "../../../node_modules/circomlib/circuits/sign.circom";

// input: any field elements
// output: 1 if field element is in (p/2, p-1], 0 otherwise
template IsNegative() {
    signal input in;

    var num2Bits[254] = Num2Bits(254)(in);
    
    signal output out <== Sign()(num2Bits);
}

// Integer division by a constant.
// From https://github.com/darkforest-eth/circuits/blob/master/perlin/perlin.circom#L51
template DivisionConstant(DIVISOR) {
    signal input dividend;

    var is_dividend_negative = dividend < 0;
    var dividend_adjustment = 1 + is_dividend_negative * -2;
    var abs_dividend = dividend * dividend_adjustment;
    var raw_remainder = abs_dividend % DIVISOR;
    var neg_remainder = DIVISOR - raw_remainder;

    signal output remainder <-- (is_dividend_negative == 1 && raw_remainder != 0) ? neg_remainder : raw_remainder;
    signal output quotient <-- (dividend - remainder) / DIVISOR;
    
    dividend === DIVISOR * quotient + remainder;

    // Check that 0 <= remainder < DIVISOR
    var sum = 0;
    for (var i=0; i < DIVISOR; i++) {
        var isEqual = IsEqual()([i, remainder]);
        sum += isEqual;
    }
    
    sum === 1;
}
