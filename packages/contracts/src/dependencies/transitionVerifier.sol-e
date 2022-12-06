//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// 2019 OKIMS
//      ported to solidity 0.6
//      fixed linter warnings
//      added requiere error messages
//
//
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;
library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() internal pure returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() internal pure returns (G2Point memory) {
        // Original code point
        return G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );

/*
        // Changed by Jordi point
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
*/
    }
    /// @return r the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) internal pure returns (G1Point memory r) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success,"pairing-add-failed");
    }
    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success,"pairing-mul-failed");
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length,"pairing-lengths-failed");
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[0];
            input[i * 6 + 3] = p2[i].X[1];
            input[i * 6 + 4] = p2[i].Y[0];
            input[i * 6 + 5] = p2[i].Y[1];
        }
        uint[1] memory out;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success,"pairing-opcode-failed");
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}
contract transitionVerifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alfa1;
        Pairing.G2Point beta2;
        Pairing.G2Point gamma2;
        Pairing.G2Point delta2;
        Pairing.G1Point[] IC;
    }
    struct Proof {
        Pairing.G1Point A;
        Pairing.G2Point B;
        Pairing.G1Point C;
    }
    function verifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alfa1 = Pairing.G1Point(
            20491192805390485299153009773594534940189261866228447918068658471970481763042,
            9383485363053290200918347156157836566562967994039712273449902621266178545958
        );

        vk.beta2 = Pairing.G2Point(
            [4252822878758300859123897981450591353533073413197771768651442665752259397132,
             6375614351688725206403948262868962793625744043794305715222011528459656738731],
            [21847035105528745403288232691147584728191162732299865338377159692350059136679,
             10505242626370262277552901082094356697409835680220590971873171140371331206856]
        );
        vk.gamma2 = Pairing.G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );
        vk.delta2 = Pairing.G2Point(
            [4241383464119235075301754857694968403525970379028895289345050109143884775192,
             7613473757771124058150192181986298962637215020491771429550018463020357327439],
            [2472850240874223327427342130724577090056880468470486549846052084242373357656,
             17669942477081143919276101317772053627954906445510994567545140879683180805988]
        );
        vk.IC = new Pairing.G1Point[](33);
        
        vk.IC[0] = Pairing.G1Point( 
            1730082118234745496052753139739726886840272452723540747631081852782359700146,
            17697189043676617373399813527759250118739302071664605315318229983974271959431
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            18069750190558446082921802547645133465882248096767142617844514726057615659389,
            11178620781247522587885598426694562208656820569519099779535696856188294871968
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            17213174429541963182338351489070817404492329319810623618771595838883011228434,
            4820459206283669783295514299893326240267406670617324889981442465028359606514
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            11488480815908823274976264731912186021275929779229900761444915635653964675489,
            20984648095292049579842133209262186121230720481830621314228873410763071819161
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            6419704532006619138680075798302304654820499119752158299462874427671887779304,
            19895628837501362633150423983542220193814621865283297177150473222149270108038
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            21345290984547154191276215054033841452158291930187221294641763889000292357293,
            3841419139641051018338032166294617971663194505444609403124358262063784562885
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            15016387597219564129832955697989746394406818653969054458051276069782698418470,
            18665779474321031502487099208006320651650764478571564221479088855428714360370
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            4534559180177809305443812242070436882900869369004549586588252200194251490228,
            15005613319634288252079772285500716389578843549485770765225369238732477940277
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            5867436570191782127278788777248205780870107020977364696987435574533903629283,
            14210492640239728187484877104439595004373191627308048826595378786378546930781
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            12674086598651806410636542779781737563694971647957156008519793363706037502665,
            5551094317281488735146721644050744742832466237471873433114807913464531699444
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            7332870981056662269023266931709724585091856476711060581980503355845582248561,
            14353108869571133356709057254563387690757888007868923284335370239168318177353
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            2255055880866486287543214361800743857966412360670969961238014841575182049815,
            8319817438902199492350209315408043877198292517021936015087676782867698315354
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            3581630871756788027120776950443318034473524338681403650200421730159930109541,
            21706736871171570293477716247699260859599184376923456509005908359818438800737
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            4843667782849641358198175855220920014993792228140210986042469345490412507610,
            14752099868337353139492394592824632205791861888354059684070322536279670725825
        );                                      
        
        vk.IC[14] = Pairing.G1Point( 
            8594393278519991265578489974896974906331716835669594040749601734227532996382,
            17157394275882407224738839263192432091569361184403858469621247306865778346255
        );                                      
        
        vk.IC[15] = Pairing.G1Point( 
            18715564042236523987907643731984739696949462409279607096309514677477080255674,
            7312469053949992624214412642866279874167376099817281302955442964820049192950
        );                                      
        
        vk.IC[16] = Pairing.G1Point( 
            10411267818403853541337193717728014936587684552677884300211697176468648031612,
            10050936568375200841716236724640589793504832082835968786365131750382185899149
        );                                      
        
        vk.IC[17] = Pairing.G1Point( 
            7492708687065980104500183087454342030299059172908304874630631519819180105398,
            6224826982624108957556409746109411446036778337391084117880666704227786898790
        );                                      
        
        vk.IC[18] = Pairing.G1Point( 
            21457528636024523783624755284741291650345742659046880492879028517271197764561,
            12445277299292506607373678159605563630064918359269310715722851534693042377883
        );                                      
        
        vk.IC[19] = Pairing.G1Point( 
            14229294562266765114084274407415865124295584364501241201198617302187893309834,
            8288812287957260315886401498507227208563803275483867443032186364656974905030
        );                                      
        
        vk.IC[20] = Pairing.G1Point( 
            5754109310952608587394171851500495880120128566226380674094569336654299673241,
            1478738991940031339164926427562726803642480433148923339576354432871652586853
        );                                      
        
        vk.IC[21] = Pairing.G1Point( 
            5034853203707994017457057448859719996063759943457230248468009777308927300312,
            6402367307719539645034010290656135288570709801162913452463542534428156587817
        );                                      
        
        vk.IC[22] = Pairing.G1Point( 
            21015987875344484627596610334878008672950754546025553021328098053283940835912,
            14665961059756143311138448212234584578946631557144205758494832002609473358232
        );                                      
        
        vk.IC[23] = Pairing.G1Point( 
            16540564388900509093853289519027465786323530407968406388237511196932406089835,
            15658522384834088270331526100879836206824743512197775056076159625933763384938
        );                                      
        
        vk.IC[24] = Pairing.G1Point( 
            6355897174091706261583997798103986629480144504939150187637080380200467639170,
            5933286538551758925798737508574683076677448985658852147078406104239122938703
        );                                      
        
        vk.IC[25] = Pairing.G1Point( 
            850929233070597680227833742523189677160725811377480192913468595105867501565,
            18188953106877854213155488733215025983501445386608672280699542821373732939594
        );                                      
        
        vk.IC[26] = Pairing.G1Point( 
            17257210835899131148849431789390028533023905664259212855760409363242474700992,
            7478916417631350958596952794839628803999170948010027954637057761085020988640
        );                                      
        
        vk.IC[27] = Pairing.G1Point( 
            6170001397100866831373290645583352117356309998947870287139479024152941747842,
            20263171529941152657366308716402514540560955935199884112565823829087321406520
        );                                      
        
        vk.IC[28] = Pairing.G1Point( 
            5230720416231529719717004251156125424498520549570540011326508711373884545318,
            4099230007935855994675993265698185186195253976452509294685327440254311363631
        );                                      
        
        vk.IC[29] = Pairing.G1Point( 
            3783012103476360624781234156930217923992562113549024455026597502519616945487,
            1467689179117557434130260044547485505527818735239612955761740877664296723068
        );                                      
        
        vk.IC[30] = Pairing.G1Point( 
            3184319624131739852460632371151138426237116528624026086074334866282849223684,
            11544799511100111364070744920535850811894675707173963636365475278777390829864
        );                                      
        
        vk.IC[31] = Pairing.G1Point( 
            6131511986919825210991169052700355442366300051755581804170769012956694272742,
            14492014384350187618080243382009015400687587133782885532923936445552386423095
        );                                      
        
        vk.IC[32] = Pairing.G1Point( 
            12919078027816638504544473866244318978023652552064028534934698104520742350495,
            10345596982574949900444890395544498228749023071705090101477889108376493727532
        );                                      
        
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.IC.length,"verifier-bad-input");
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field,"verifier-gte-snark-scalar-field");
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.IC[0]);
        if (!Pairing.pairingProd4(
            Pairing.negate(proof.A), proof.B,
            vk.alfa1, vk.beta2,
            vk_x, vk.gamma2,
            proof.C, vk.delta2
        )) return 1;
        return 0;
    }
    /// @return r  bool true if proof is valid
    function verifyProof(
            uint[8] memory proofData,
            uint[32] memory input
        ) public view returns (bool r) {
        Proof memory proof;
        proof.A = Pairing.G1Point(proofData[0], proofData[1]);
        proof.B = Pairing.G2Point([proofData[2], proofData[3]], [proofData[4], proofData[5]]);
        proof.C = Pairing.G1Point(proofData[6], proofData[7]);
        uint[] memory inputValues = new uint[](input.length);
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
