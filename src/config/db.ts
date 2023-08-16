//连接数据库
import config from './index'
import logger from './log4js'

export const mongoose = require('mongoose');

// const connectURL = `mongodb://${config['DB_SERVER']}:${config['DB_PORT']}/${config['DB_NAME']}`
// const connectURL = config['mongodb_url']

// export const db_connect = mongoose.connect.bind(
//     null, 
//     config['mongodb_url'], 
//     {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     maxPoolSize: 10,
//     serverSelectionTimeoutMS: 5000,
//     socketTimeoutMS: 45000
// });



// dbName: xenon_notary
const options = {
    dbName: config["dbName"]
    /*autoIndex: false, // Don't build indexes
    maxPoolSize: config["mongodb"].maxPoolSize, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: config["mongodb"].serverSelectionTimeoutMS, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: config["mongodb"].socketTimeoutMS, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
    seNewUrlParser: true,
    useUnifiedTopology: true*/
};

export async function connect() {
    try {
        await mongoose.connect(config["mongodb"].uri,options);
        // mongoose.set('debug', true);
        // mongoose.set('debug', function(collectionName, methodName, ...methodArgs) {
        //     logger.log('Mongoose: %s.%s(%s)',collectionName,methodName, JSON.stringify(methodArgs));
        // })
        logger.log('Successfully connected to MongoDB');
    } catch (error) {
        logger.error(error);
    }
}
