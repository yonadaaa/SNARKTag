# SNARKTag

An application-specific ZK-rollup for playing the game [Tag](https://en.wikipedia.org/wiki/Tag_(game)), secured by Ethereum and Zero-knowledge validity proofs.

Three abstract squares, of different speeds and sizes, fly around an [Asteriods](https://en.wikipedia.org/wiki/Asteroids_(video_game))-style wraparound world in real-time. When two squares collide, they realistically bounce off eachother. If one of them is currently "it", that status is transferred to the other.

While gameplay is not simulated on-chain, the rollup is _completely_ trustless. All user inputs are logged on-chain and the state of the game can be permissionessly "reported" to Layer 1 at predefined intervals, using zkSNARK proofs.

![image](https://user-images.githubusercontent.com/29184158/207866750-da84aa5e-85a0-4a74-877d-e6454bfa5eec.png)

This focus on tailor-made rollups began with the much simpler [Battle Rollup: Payments edition](https://github.com/fraserdscott/battle-rollup). SNARKTag has a number of improvements - namely that it is a complex real-time game, and the rollup is more modular, persistent, and built on [MUD](https://mud.dev/).

Repo originally forked from [Mudbasics](https://github.com/latticexyz/mudbasics).
