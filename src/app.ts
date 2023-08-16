
import Koa from 'koa'
import bodyParser   from 'koa-bodyparser'
import cors   from 'koa2-cors'
import promClient from 'prom-client'
const CronJob = require( 'cron').CronJob;

// import { queryStatus } from './service/ScheduledTaskService';
import {_scanTransactionForReport} from './service/TransactionReportService'
import {_processPendingTransaction} from './service/TransactionService'
import { _activeRemoteMiner } from './service/ActiveMinerService';
import {_theGraphQueryEvents} from './service/TheGraphQueryService'

import config from './config/index'
import logger from './config/log4js'
import router from './router'

//启动web服务
const app = new Koa()
app.use(bodyParser())
app.use(cors())

//服务监控接口
const collectDefaultMetrics = promClient.collectDefaultMetrics;
const register  = promClient.register ;
collectDefaultMetrics({ gcDurationBuckets: [0.1, 0.2, 0.3] });

router.get('/metrics',  async (ctx) => {
    ctx.headers['content-type'] = register.contentType;
    ctx.body = await  register.metrics();
});

app.use(router.routes()).use(router.allowedMethods())
app.listen(config['port'],() => {
    logger.log('Starting the server,app_name='+config['serviceName']+', env='+config['env']+',port='+config['port']);
})


let job_query_the_graph = new CronJob(
    '0-59/20 * * * * *',
    _theGraphQueryEvents,
    null,
    true,
    null,
    null,
    false
)

// ////used for self test
// let job_scan_for_report = new CronJob(
//     '0-59/15 * * * * *',
//     _scanTransactionForReport,
//     null,
//     true,
//     null,
//     null,
//     false
// )

// ////used for self test
// let job_process_pending_transaction = new CronJob(
//     '0-59/20 * * * * *',
//     _processPendingTransaction,
//     null,
//     true,
//     null,
//     null,
//     false
// )

// ////used for self test
// let job_active_remote_miner = new CronJob(
//     '0-59/15 * * * * *',
//     _activeRemoteMiner,
//     null,
//     true,
//     null,
//     null,
//     false
// )