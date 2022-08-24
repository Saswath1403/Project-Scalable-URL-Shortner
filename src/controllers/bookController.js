///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////     MODULES   AND   PACKAGES  IMPORTED     ///////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const shortId = require("shortid");                         // USING IT FOR CREATING SHORT ID
const bookModel = require("../models/bookModel");             // REQUIRED THIS MODEL FOR DB-CALLS
const redis = require("redis");                             // USING REDIS PACKAGE FOR CACHING
const { promisify } = require("util");                      // USING UTIL PACKAGE FOR CREATING PROMISE

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////     CREATING    REDIS   CLIENT      ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const redisClient = redis.createClient(
    10398,// PORT
    "redis-10398.c212.ap-south-1-1.ec2.cloud.redislabs.com",                   // CLIENT END-POINT
    { no_ready_check: true }
);
redisClient.auth("hvbyvcPuFpChZ3M8cozmFILuUwv4ZMWG", function (err) {        // AUTHENTICATING USER VIA PASSWORD
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");        // SENDING MESSAGE TO CONSOLE FOR SUCCESSFUL CONNECTION OF REDIS
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);         // DEFINING SET FUNCTION OF REDIS
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);        // DEFINING GET FUNCTION OF REDIS

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////       CREATE    BOOK     API      //////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////



const createBook = async (req, res) => {
    try {
        let {name, author, category} = req.body

        const bookCreation = await bookModel.create(req.body)

        res.status(201).send({ status: true, message: 'Success', data: bookCreation })

    } catch (err) {
    return res.status(500).send({ status: false, message: err.message })
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////      GET     BOOK     API     ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getBook = async (req, res) => {
    try {
         const bookId = req.params.bookId
        let cache = await GET_ASYNC(`${bookId}`)
        cache = JSON.parse(cache)
        // let count = 0
    
        if ( cache ) return res.status(200).send(cache)
        

        const findBook = await bookModel.findOne({ _id:bookId })
        // if(findBook) count ++
        // we can set the count  in Set Async and in get Async if the count is more than 5 than  show error
       
        await SET_ASYNC(`${bookId}`, JSON.stringify(findBook))           // STORING THE DATA IN CLOUD FOR FURTHER USE

        return res.status(200).send(findBook)

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////     MODULES    EXPORTED     ////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = { createBook, getBook }