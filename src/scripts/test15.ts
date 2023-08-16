
import { Contract, InfuraProvider, SigningKey, BaseWallet, computeAddress} from "ethers";

const provider = new InfuraProvider("matic","68a2de3671204e8c91871ee8d0c927f3")

const abi = [
    "function decimals() external view returns(uint8)",
];
let contract = new Contract('0x9C5653339E0B3A99262997FbB541E2562f3361C9', abi, provider);



(async function(){
    try{
        let decimal = await contract.decimals()
        console.log(decimal.toString()) 
    }catch(error:any){
        console.log("<<< error in getERC20Decimal >>>\n", error)
    }
})()