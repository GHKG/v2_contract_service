import { getWithdrawDigest } from "../utils/Instrument";

let contract_addr = "0x0C571e92D745756712Ded770eF427c6b51Cab6e3"
let domain_name =  "Arkreen Reward"
let version = "1"

let chainId = 80001

let recipient = "0x0002C64426CBBA3234ACC4DF53C4E42F36D5C566"
let value = 100
let nonce = 1

let digest = getWithdrawDigest(
    recipient,
    BigInt(value),
    BigInt(nonce),
    contract_addr,
    domain_name,
    version,
    chainId
)

console.log(digest)