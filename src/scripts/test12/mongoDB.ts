import "reflect-metadata";
export const mongoose = require('mongoose');
import logger from './log4js'

const _mongodb_uri = "mongodb+srv://arkreen-dev:DBlCrhTuFoln5RTN@cluster0.trt9tgo.mongodb.net?retryWrites=true&w=majority"
const _dbName = "xenon_contract"

const options = {
    // dbName: config["dbName"]
    dbName: _dbName
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
        await mongoose.connect(_mongodb_uri,options);
        mongoose.set('debug', true);
        mongoose.set('debug', function(collectionName, methodName, ...methodArgs) {
            logger.log('Mongoose: %s.%s(%s)',collectionName,methodName, JSON.stringify(methodArgs));
        })
        logger.log('Successfully connected to MongoDB');
    } catch (error) {
        logger.error(error);
    }
}

