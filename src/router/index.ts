import  Router  from 'koa-router'
import {
    JSONRPCServer,
    JSONRPCRequest,
    JSONRPCServerMiddlewareNext,
    JSONRPCParams,
    JSONRPCID,
    JSONRPCErrorResponse, createJSONRPCErrorResponse,
} from 'json-rpc-2.0'
import Koa, {Next} from "koa";

import {RpcCode} from "../utils/RpcCode";
import logger from "../config/log4js";

import {EntityMetadataNotFoundError} from "typeorm";

const router:Router = new Router()
import initMethods from "./initMethods";
const jsonrpcServer:JSONRPCServer = new JSONRPCServer();


const logMiddleware = (next:JSONRPCServerMiddlewareNext<JSONRPCParams>, request:JSONRPCRequest, serverParams:JSONRPCParams) => {
    logger.log(`Received ${JSON.stringify(request)}`);
    return next(request, serverParams).then((response) => {
        logger.log(`Responding ${JSON.stringify(response)}`);
        return response;
    });
};

const exceptionMiddleware = async (next:JSONRPCServerMiddlewareNext<JSONRPCParams>, request:JSONRPCRequest, serverParams:JSONRPCParams) => {
    try {
        return await next(request, serverParams);
    } catch (error) {
        // logger.error(error)
        //特定异常处理
        if (error instanceof EntityMetadataNotFoundError) {
            return createJSONRPCErrorResponse(<JSONRPCID>request.id, RpcCode.INTERNAL_ERROR.code, RpcCode.INTERNAL_ERROR.message);
        }else{
            //通用异常处理
            const jsonRpcErrorResponse=<JSONRPCErrorResponse>error
            jsonRpcErrorResponse.id=<JSONRPCID>request.id
            return jsonRpcErrorResponse;
        }
    }
};
// @ts-ignore
jsonrpcServer.applyMiddleware(logMiddleware, exceptionMiddleware);

//初始化method
initMethods(jsonrpcServer)


router.post(['/v2'],  (ctx: Koa.Context,next:Next)=>{
    let jsonRPCRequest:JSONRPCRequest = <JSONRPCRequest>ctx.request.body
    return new Promise(function(resolve, reject){
        jsonrpcServer.receive(jsonRPCRequest).then((jsonRPCResponse) => {
            if (jsonRPCResponse) {
                ctx.body = jsonRPCResponse;
                resolve(jsonRPCResponse);
            } else {
                ctx.body = jsonRPCResponse;
                resolve(jsonRPCResponse);
            }
        });
    });
});
export default  router
