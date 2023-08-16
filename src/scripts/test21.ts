import { Contract, InfuraProvider, SigningKey, BaseWallet, computeAddress, Wallet, parseEther, parseUnits} from "ethers";

const provider = new InfuraProvider("maticmum","0ab4ce267db54906802cb43b24e5b0f7")
// const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
const receiver = "0xBAeF5d8EfA74d3cff297D88c433D7B5d90bf0e49"
const payer = "0x2df522C2bF3E570caA22FBBd06d1A120B4Dc29a8"   //who pay for the gas
const payer_key = "0xf9288eb4632cb4ee9e2d2c71bce7e57f16b2cc8be697af77f5dbb3c71fd3bcc0"
const contract_address = "0x960C67B8526E6328b30Ed2c2fAeA0355BEB62A83"

async function main(){
    
    const wallet = new Wallet(payer_key, provider)

    const nonce = await wallet.getNonce()

    console.log("nonce is : ", nonce)
    // return

    const transaction = {
        to: receiver, // 替换为您要发送到的地址
        value: parseEther('0.0001'), // 替换为您要发送的以太币数量
        gasLimit: 21000, // 设置固定的 gas 限制
        // gasPrice: parseUnits('1', 'gwei'), // 替换为适当的 gasPrice
        // data: '0x', // 替换为适当的 data（如果有）
        nonce: 5080
      };

    const receipt = await  wallet.sendTransaction(transaction)
    await receipt.wait() // 等待链上确认交易
    console.log(receipt) // 打印交易详情

}

main()
    .then()
    .catch(error => {
    console.error(error);
    process.exit(1);
    });      