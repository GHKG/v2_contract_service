import { Keccak  } from "sha3";
import { keccak256 } from "ethers";

const message = `{"minerAddress":"0x168e3da805f372868fa9e1ac763820a2b27f8ca6","originalOwnerAddress":"0x2df522c2bf3e570caa22fbbd06d1a120b4dc29a8","ownerAddress":"0xbaef5d8efa74d3cff297d88c433d7b5d90bf0e49","nftTxHash":"0x44071dcf6bf2da29b12e1aa72033f0612035dff02b61ebe58d5c1ca9db45a620"}`
const hash = new Keccak(256);
hash.update(Buffer.from(message));

console.log(hash.digest())
console.log(keccak256(Buffer.from(message)))