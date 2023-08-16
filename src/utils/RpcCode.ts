export const RpcCode = {

    //json rpc 标准错误码
    INVALID_JSON_REQUEST: {code: -32600, message: 'An invalid request object was sent '},
    METHOD_NOT_FOUND: {code: -32601, message: 'The method does not exist or is invalid '},
    INVALID_PARAMS: {code: -32602, message: 'Invalid method parameter '},
    INTERNAL_ERROR: {code: -32603, message: 'Internal call error  '},
    PROCEDURE_IS_METHOD: {code: -32604, message: 'Internal error, request did not provide id field '},
    JSON_PARSE_ERROR: {code: -32700, message: 'The JSON received by the server cannot be parsed '},


    //业务状态码
    PARAMS_ADDRESS_REQUIRED: {code: 2000, message: 'parameter address is required'},

    //操作成功
    // SUCCESS: {code: 0, message: "success"},

    //操作失败
    // FAILED: {code: 1, message: "failed"},

    /**
     * 鉴权相关
     */
    // VALIDATE_FAILED: {code:1001, message: "Checkout failure"},
    // VALIDATE_TIMESTAMP_NOEMPTY: {code:1001, message: "Timestamp can not be empty"},
    // VALIDATE_TIMESTAMP_EXPIRED: {code:1002, message: "Timestamp has expired"},
    // VALIDATE_TIMESTAMP_FORMAT: {code:1003, message: "Timestamp format error"},
    //
    // VALIDATE_CLIENTID_NOEMPTY: {code:1004, message: "client_id can't be empty"},
    // VALIDATE_CLIENTID_EXPIRED: {code:1005, message: "client_id timestamp has expired"},
    // VALIDATE_CLIENTID_FAILED: {code:1006, message: "client_id Incorrect"},
    //
    // VALIDATE_SIGN_NOEMPTY: {code:1007, message: "sign can't be empty"},
    // VALIDATE_SIGN_FAILED: {code:1008, message: "sign Incorrect"},


    /**
     * 系统错误
     */
    ERROR: {code: 2000, message: "system abnormality"},
    TIMEOUT: {code: 2001, message: "overtime"},
    // PARAMETER_FORMATE_ERROR: {code: 2002, mesage: "Parameter format error"},
    // HTTP_REQUEST_METHOD_NOT_SUPPORTED: {code: 2003, message:"Parameter format error"},
    // FORBIDDEN:{code:2004, message: "No access rights, please contact the administrator for authorization"},
    // REPEAT_RECORD:{code:2005, message: "record repeat"},

    //业务错误
    /**
     * 设备相关
     */
    // BUSINESS_DEVICE_ID_EXISTED: {code:3001, message: "device id is existed"},
    //
    // BUSINESS_DEVICE_PAYER_SIGN_ERROR: {code:3002, message: "payer sign error"},
    //
    // BUSINESS_DEVICE_OWNER_SIGN_ERROR: {code:3003, message: "owner sign error"},
    //
    // BUSINESS_DEVICE_MINER_SIGN_ERROR: {code:3004, message: "miner sign error"},

    BUSINESS_DEVICE_NOT_EXISTED: {code: 3005, message: "device is not existed"},

    // BUSINESS_DEVICE_NO_ONBOARD: {code:3006, message: "miner did not do onboard"},
    // BUSINESS_DEVICE_TERMINATE: {code:3007, message: "miner has been terminated"},
    // BUSINESS_DEVICE_BOUND: {code:3008, message: "device is bound"},
    BUSINESS_NO_DEVICE_BOUND: {code: 3009, message: "no device is bound"},

    // BUSINESS_AIRDROPDEVICE_NOT_EXISTED: {code:3009, message: "airdrop device is not exist"},
    // BUSINESS_AIRDROPDEVICE_EXISTED: {code:3010, message: "airdrop device is existed"},
    // BUSINESS_AIRDROPDEVICE_CLAIMED: {code:3011, message: "airdrop device is claimed"},
    // BUSINESS_AIRDROPDEVICE_CLAIM_EXPIRED: {code:3012, message: "airdrop device is claim expired"},
    // BUSINESS_OWNER_BIND_APPLY_SIGN_ERROR: {code:3013, message: "The signature of the owner binding application is incorrect"},
    // BUSINESS_DEVICE_MAKER_INFO_ERROR: {code:3014, message: "maker information error"},
    // BUSINESS_DEVICE_GMAE_MINER_TOTAL_NUMBER: {code:3015, message: "Total miner exceeds limit"},
    // BUSINESS_DEVICE_GMAE_MINER_SINGLE_NUMBER: {code:3016, message: "The amount of miners that a single user can apply for exceeds the limit"},
    // BUSINESS_NFT_CASTING_FAILED: {code:3017, message: "nft casting failed"},
    // BUSINESS_DEVICE_GMAE_MINER_SINGLE_NUMBER_FOR_EMAIL: {code:3018, message: "The amount of miners that a single email can apply for exceeds the limit"},


    // 账户相关
    // BUSINESS_ACCOUNT_EXISTED: {code:4001, message: "account is existed"},
    BUSINESS_ACCOUNT_NOT_EXIST: {code: 4002, message: "account is not exist"},
    // BUSINESS_PAYER_ACCOUNT_NOT_EXIST: {code:4003, message: "payer account is not exist"},
    // BUSINESS_PAYER_ACCOUNT_NOT_ENOUGH: {code:4004, message: "payer account not enough"},
    // BUSINESS_TRANSACTION_FAIL: {code:4005, message: "transaction failed"},
    // BUSINESS_TRANSACTION_SIGN_ERROR: {code:4006, message: "transaction signature error"},
    BUSINESS_OWNER_ACCOUNT_NOT_EXIST: {code: 4007, message: "owner account is not exist"},
    // BUSINESS_FOUNDATION_SIGN_ERROR: {code:4008, message: "foundation signature error"},
    // BUSINESS_ACCOUNT_REWARD_SEARCH_DAY_RANGE_ERROR: {code:4009, message: "account reward days range error"},
    // BUSINESS_ACCOUNT_MAKER_NOT_EXIST: {code:4010, message: "maker account is not exist"},
    // BUSINESS_ACCOUNT_SIGN_ERROR: {code:4011, message: "maker account signature error"},
    // BUSINESS_ACCOUNT_BLANCE_INSUFFICIENT: {code:4012, message: "Insufficient account balance"},
    // BUSINESS_ACCOUNT_NONCE_MISMATCH_PATTERN: {code:4013, message: "nonce pattern mismatch"},
    BUSINESS_UNSUPPORT_QUERY_ACCOUNT_TYPE: {code: 4014, message: "unsupport query this type account"},

    // pogg相关
    // BUSINESS_POGG_REPORT_SIGN_ERROR: {code:4101, message: "pogg report sign error"},
    //
    // BUSINESS_POGG_RESPONSE_SIGN_ERROR: {code:4102, message: "pogg response sign error"},
    //
    // BUSINESS_POGG_CHALLENGE_EXPIRED: {code:4103, message: "pogg challenge expired"},
    //
    // BUSINESS_POGG_CHALLENGE_NO_HIT: {code:4104, message: "pogg challenge no hit"},

    BUSINESS_POGG_REPORT_NOT_EXIST: {code: 4105, message: "this pogg report not exist"},

    // 空投相关
    // BUSINESS_AIRDROP_NOT_ACTIVE: {code:6001, message: "airdrop not active"},

    //Reward
    BUSINESS_NO_REWORDS_RECORDS: {code: 7001, message: "account is not exist or no rewards records"},

    //power
    BUSINESS_NO_GREEN_POWER_GENERATED: {code: 8001, message: "no green power generated"},

    //transaction
    BUSINESS_TX_NOT_EXIST: {code: 9001, message: "transaction not exist"},
    BUSINESS_ACCOUNT_OR_TX_TYPE_NOT_EXIST: {code: 9002, message: "account or this type transactions not exist"},
    BUSINESS_TXS_NOT_FOUND_IN_BLOCK: {code: 9003, message: 'transaction Not Found in block'},

    //block
    BUSINESS_BLOCK_NOT_FOUND: {code: 10001, message: 'The block not found'},
    BUSINESS_BLOCK_HEIGHT_NOT_FOUND: {code: 10002, message: 'Block Height Not Found'},

    //mongodb
    BUSINESS_MONGODB_DUPLICATE_KEY: {code:-11000, message: 'Duplicate key error in mongodb because of query_hash unique restriction'},
    BUSINESS_MONGODB_ADD_RECORD_FAILED: {code:-11001, message: 'Add new record error in mongodb'},
    BUSINESS_MONGODB_UPDATE_FAILED: {code:-11002, message: 'Update record failed in mongodb'},

    //contract transaction
    BUSINESS_SEND_TRANSACTION_FAILED: {code:-5, message: 'Send transaction failed'},
    BUSINESS_WAIT_FOR_TRANSACTION_ERROR: {code:-6, message: 'Error in wait for transaction'},


    //
    BUSINESS_INVALID_CALL_SERVICE_NAME:{code: -21000, message: 'Invalid call_service in params'},

    


    
}
