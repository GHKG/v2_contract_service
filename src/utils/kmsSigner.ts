import { VoidSigner, Provider , Transaction,TransactionLike,  assertArgument,
  resolveAddress, hashMessage, TransactionRequest,  resolveProperties, getAddress} from "ethers"
import logger from '../config/log4js'
import {kmsRpcService} from "../rpc/KMSRpcService";

// const fetch=require("node-fetch")


export class kmsSigner extends VoidSigner {

    ethereumAddress: string;
    keyId: string;

    constructor(signerAddr: string, keyId: string, provider: Provider) {
        super( signerAddr, provider);
          Object.defineProperty(this, "provider", {
            value: provider,
            writable: false
          });
        //   ethers.utils.defineReadOnly(this, "kmsCredentials", kmsCredentials);
        this.ethereumAddress = signerAddr
        this.keyId = keyId
    }

    async getAddress(): Promise<string> {
        return this.ethereumAddress
    }

    async _signDigest(digestString: string): Promise<string> {
        const sig = await requestKmsSignature(this.keyId, digestString);
        return `0x${sig.r.toString(16)}`+ `${sig.s.toString(16)}` + sig.v.toString(16) 
    }

    async signMessage(message: string | Uint8Array): Promise<string> {
        return this._signDigest(hashMessage(message));
    }

    async signTransaction(tx: TransactionRequest): Promise<string> {
      // Replace any Addressable or ENS name with an address
        const { to, from } = await resolveProperties({
          to: (tx.to ? resolveAddress(tx.to, this.provider): undefined),
          from: (tx.from ? resolveAddress(tx.from, this.provider): undefined)
        });

        if (to != null) { tx.to = to; }
        if (from != null) { tx.from = from; }

        if (tx.from != null) {
            assertArgument(getAddress(<string>(tx.from)) === this.address,
                "transaction from address mismatch", "tx.from", tx.from);
            delete tx.from;
        }

        // Build the transaction
        const btx = Transaction.from(<TransactionLike<string>>tx);
        btx.signature =await this._signDigest(btx.unsignedHash)

        return btx.serialized;
    }

    connect(provider: null | Provider): VoidSigner {
        // return new VoidSigner(this.address, provider);
        return new kmsSigner(this.ethereumAddress,this.keyId, provider!);
    }

}

// const kmsRpcService:KMSRpcService =new KMSRpcService()
export async function requestKmsSignature(keyId: string, digest: string) : Promise<{ v: any; r: any; s: any; }>{

    for(let i=0; i<3; i++){

      try{

        let sig:any = await kmsRpcService.signByKeyId({ keyId: keyId , hash: digest.slice(2)})
        let rawsig= {
            r: sig.r,
            s: sig.s,
            v: sig.recid + 27
        }
        return rawsig
  
      }catch(e:any){
        logger.info("try count: ", i+1)
        logger.info("error in requestKmsSignature from kmsSigner.ts")
        logger.info(e)
        
      }
    }

    logger.info(`After 3 attempts, kms still throw error, so contract-service have to return "{r:0,s:0,v:0}" to caller`)
    return {r:0,s:0,v:0}

}
