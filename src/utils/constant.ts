

export const JsonrpcMethod={
    kms:{
        signByKeyId:'kms_signByKeyId'
    },
    remoteMiner:{
        requestActivateMiner:'rms_requestActivateMiner'
    },
    notary:{
        certifyRec:'rec_certifyRec'
    },
    standardMiner:{
        requestActivateMiner:'sdm_activateMinerByNftMintEvent'
    },
    device:{
        transferMiner:'tx_transfer_miner'
    }
}

// export const ReportInterface = {
//     demo_call_service:{
//         url:"rul_demo_call_service",
//         interface_XXX:{
//             callback_method:"method X",
//         },
//         interface_YYY:{
//             callback_method:"method Y",
//         },
        
//     },
//     notary_service:{
//         url:'url_notary_call_service',
//         method:'method 2'
//     },
//     miner_service:{
//         url:'url_miner_call_service',
//         method:'method 3'
//     },
//     arec_service:{
//         url:'url_arec_call_service',
//         method:'method 4'
//     }
// }
