import {getDomainSeparator} from '../utils/Instrument'


let name="USD Coin (PoS)"
let version="1"
let chainId=80001
let contractAddress_="0x9C5653339E0B3A99262997FbB541E2562f3361C9"

console.log(getDomainSeparator(name, version, contractAddress_, chainId)) 