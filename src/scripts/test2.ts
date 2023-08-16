import axios, { AxiosError } from 'axios';

interface RpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: Object;
  id: number;
}

interface RpcResponse<T> {
  jsonrpc: '2.0';
  data?:Object
  result?: T;
  error?: {
    code: number;
    message: string;
  };
  id: number;
}

/**
 * 封装一个 rpc 请求，并返回响应结果。
 * @param url - 服务器地址
 * @param method - 方法名
 * @param params - 参数列表
 * @returns `Promise` 对象，响应结果泛型类型为 `T`。
 */
async function callRpc<T>(url: string, method: string, params:Object): Promise<T> {
  try {
    const response = await axios.post<RpcRequest, RpcResponse<T>>(url, {
      jsonrpc: '2.0',
      method,
      params,
      id: 1,
    });

    console.log(response.data)

    if (response.result) {
      return response.result;
    } else {
      throw new Error(response.error?.message || 'Unknown error');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<RpcResponse<T>>;
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error.message);
      }
    }
    throw new Error('RPC request failed');
  }
}


interface User {
    id: number;
    name: string;
  }
  
  async function getUser(id: number): Promise<User> {
    const url = 'http://localhost:4000';
    const method = 'kms_signByKeyId';
    const params = { keyId: "key_save_data" ,
     hash:"9d91ddb51e25bf24c60151d7660fe4d09b4fb1b9cc47c8e0f09c65de4484f454"}
    return await callRpc<User>(url, method, params);
  }


  async function main() {
    await getUser(1)
  }
  main()
      .then(() => process.exit(0))
      .catch(error => {
      console.error(error);
      process.exit(1);
      });
  
  