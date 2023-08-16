import {configure,getLogger} from 'log4js'
import path from "path";

const logFilePath=process.env.LOGFILE_PATH as string

const filePath=path.join(__dirname,logFilePath!)
const options:any={
    appenders: {
        fileout: {
            type: "dateFile",
            filename: filePath,
            layout: {
                type: 'pattern',
                pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} %p %c %m'
            },
            pattern: "yyyy-MM-dd",
            alwaysIncludePattern: true,
            keepFileExt:true,
            numBackups: 7
        },
        console: {
            type: "console",
            layout: {
                type: 'pattern',
                pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} %p %c %m'
            }
        }
    },
    categories: {
        default: {
            appenders: ["fileout", "console"],
            level: "info"
        }
    }
}
configure(options)

const logger = getLogger("out")

export default logger

