import {computeAddress, keccak256, toUtf8Bytes,AbiCoder, solidityPacked} from "ethers";


const USDC_ON_mumbai = {
    chain_id: 80001,
    address: "0x9C5653339E0B3A99262997FbB541E2562f3361C9",
    version: "1",
    name: "USD Coin (PoS)",

    // keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")
    typehashEip712Domain:'0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f',
    // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)")
    typehashPermit : '0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9'
}


const USDC_ON_polygon = {
    chain_id: 137,
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    version: "1",
    name: "USD Coin (PoS)",

// keccak256("EIP712Domain(string name,string version,address verifyingContract,bytes32 salt)")
    typehashEip712Domain : '0x36c25de3e541d5d970f66e4210d728721220fff5c077cc6cd008b3a0c62adab7',
// keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)")
    typehashPermit : '0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9'
}



function getDomainSeparator(contract_obj) {

    var typeHash = contract_obj.typehashEip712Domain;
    var name = keccak256(toUtf8Bytes(contract_obj.name));
    var version = keccak256(toUtf8Bytes(contract_obj.version));
    // var chain = numberToUint256(contract_obj.chain_id);
    var chainId = contract_obj.chain_id;
    var address = contract_obj.address;
  
    var abiCoder = AbiCoder.defaultAbiCoder();
    if (chainId === 137) {
      return keccak256(
        abiCoder.encode(
          ['bytes32', 'bytes32', 'bytes32', 'address', 'uint256'],
          [typeHash, name, version, address, chainId]
        )
      );
  
    } else if (chainId === 80001) {
      return keccak256(
        abiCoder.encode(
          ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
          [typeHash, name, version, chainId, address]
        )
      );
  
    } else {
      throw new Error(`Unknow Blockchain ID: ${chainId}`);
    }
  } 

function getDigest( contract_obj, owner, spender, value, nonce, deadline){
  
    var abiCoder = AbiCoder.defaultAbiCoder();
    var dataHash = keccak256(
        abiCoder.encode(
            ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
            [
                contract_obj.typehashPermit,
                owner,
                spender,
                value,
                nonce,
                deadline
            ]
        )
    );

    var domainSeparator = getDomainSeparator(contract_obj);
    var digest = keccak256(
        solidityPacked(
            ['bytes1', 'bytes1', 'bytes32', 'bytes32'], 
            ['0x19', '0x01', domainSeparator, dataHash]
        )
    );
    return digest
}


export  async function getPermitSignature(signingKey, spender, value, nonce, deadline, chainId){

    let digest;
    const owner = computeAddress(signingKey.publicKey)

    if(chainId === 80001){
      digest = getDigest(USDC_ON_mumbai, owner ,spender, value, nonce, deadline)
    }else if(chainId === 137){
      digest = getDigest(USDC_ON_polygon, owner ,spender, value, nonce, deadline)
    }
    
    return signingKey.sign(digest)
}

