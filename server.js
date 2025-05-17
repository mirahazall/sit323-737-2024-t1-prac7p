/**
Simple Node.js + Express Server
 * 
 * This server serves an `index.html` file that simply displays a calculation when users visit the root URL http://localhost:3000.
 * The `express.static()` middleware is used to serve the static files inside the `public` folder such as `index.html`.
 * 
 */

var express = require('express'); // Imports the express module
const winston = require('winston'); // Imports winston for logging
const mongoose = require('mongoose'); //imports mongodb client
const Calculation = require("./models/calculation");
require('dotenv').config();

const mongoUri = process.env.MONGO_URI;

console.log(`Connecting to MongoDB at: ${mongoUri}`);


mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

  module.exports = mongoose;

// Configures the logger
const logger = winston.createLogger({
    level: 'info', // Sets log level to 'info'
    format: winston.format.json(),
    defaultMeta: { service: 'calculator-microservice' },
    transports: [
    new winston.transports.Console({
    format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level:
    'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }), // Logs to a file
    ],
    });

var app = express(); // Initializes Express application
var port = 3000; // Defines the port for the server

app.use(express.static('public')); //Middleware to serve static files inside the `public` directory such as `index.html`
app.use(express.json()); // Middleware to parse JSON requests

// Function to validate numbers. It checks if both entered values are numbers.
function validateNumbers(number1, number2){
    if(typeof number1 !== "number" || typeof number2 !== "number"){
        return res.status(400).json({error: "num1 and num2 must be numbers"});
    }
    return null;
}

// Health check route
app.get('/health', async(req, res) => {
    try {
        const mongoState = mongoose.connection.readyState; // It checks if the app is currently connected to the MongoDB server. readyState === 1 means it's healthy.
    
        const dbStats = await mongoose.connection.db.command({ serverStatus: 1 }); //Runs a built-in MongoDB command that returns real-time info about: Uptime (how long MongoDB has been running), Connections (active and available), OpCounters (number of operations like insert, query, update)
    
        const healthReport = {
          status: 'OK',
          uptime: process.uptime(), //It gives how long the app (Node.js process) has been running (in seconds).
          memoryUsage: process.memoryUsage(), //It shows how much memory our app is using.
          mongo: {
            state: mongoState === 1 ? 'connected' : 'disconnected',
            uptime: dbStats.uptime,
            connections: dbStats.connections,
            opcounters: dbStats.opcounters,
          }
        };
    
        res.status(200).json(healthReport);
      } catch (err) {
        res.status(500).json({
          status: 'ERROR',
          message: 'MongoDB health check failed',
          error: err.message
        });
      }
    });    

// Addition operation endpoint
app.post("/add", async(req, res) => {
    const {operation, number1, number2} = req.body;
    const error = validateNumbers(number1, number2);
    if(error){
        logger.log({
            level: 'error',
            message: `Error in addition operation: ${error}`
            });
        return res.status(400).json({error});
    }else{
        const result = number1 + number2;
        logger.log({
            level: 'info',
            message: `New add operation requested: ${number1} + ${number2} = ${result}`
            });

            try {
                const calculation = new Calculation({ operation, number1, number2, result });
                await calculation.save();
                console.log("Calculation saved");
              } catch (err) {
                console.log("Error saving calculation", err);
              }

        res.json({result});
    }
});

//Subtraction operation endpoint
app.post("/subtract", async(req, res) => {
    const {operation, number1, number2} = req.body;
    const error = validateNumbers(number1, number2);
    if(error){
        logger.log({
            level: 'error',
            message: `Error in subtraction operation: ${error}`
        })
        return res.status(400).json({error});
    }else{
        const result = number1 - number2;
        logger.log({
            level: 'info',
            message: `New subtract operation requested: ${number1} - ${number2} = ${result}`
        })

        try {
            const calculation = new Calculation({ operation, number1, number2, result });
            await calculation.save();
            console.log("Calculation saved");
          } catch (err) {
            console.log("Error saving calculation", err);
          }
        return res.json({result});
    }
})

//Division operation endpoint
app.post("/divide", async(req, res) => {
    const {operation, number1, number2} = req.body;
    const error = validateNumbers(number1, number2);
    if(error){
        logger.log({
            level: "error",
            message: `Error in division operation: ${error}`
        })
        return res.status(400).json({error});
    }else if(number2 === 0){
        return res.status(400).json({error:"It's not possible to divide by 0"});
    }else{
        const result = number1/number2;
        logger.log({
            level: 'info',
            message: `New divide operation requested: ${number1} / ${number2} = ${result}`
        })

        try {
            const calculation = new Calculation({ operation, number1, number2, result });
            await calculation.save();
            console.log("Calculation saved");
          } catch (err) {
            console.log("Error saving calculation", err);
          }
        return res.json({result});
    }
    
});

//Multiplication operation endpoint
app.post("/multiply", async(req, res) => {
    const {operation, number1, number2} = req.body;
    const error = validateNumbers(number1, number2);
    if(error){
        logger.log({
            level: 'error',
            message: `Error in multiply operation: ${error}`
        })
        return res.status(400).json({error});
    }else{
        const result = number1 * number2;
        logger.log({
            level: 'info',
            message: `New multiply operation requested: ${number1} * ${number2} = ${result}`
        })
        try {
            const calculation = new Calculation({ operation, number1, number2, result });
            await calculation.save();
            console.log("Calculation saved");
          } catch (err) {
            console.log("Error saving calculation", err);
          }
        res.json({result});
    }
});

//Exponentiation operation endpoint
app.post("/exponentiation", async(req, res) => {
    const {operation, number1, number2} = req.body;
    const error = validateNumbers(number1, number2);
    if(error){
        logger.log({
            level: 'error',
            message: `Error in exponentation operation: ${error}`
        })
        return res.status(400).json({error});
    }else{
        const result = number1 ** number2;
        logger.log({
            level: 'info',
            message: `New exponentation operation requested: ${number1} ** ${number2} = ${result}`
        })
        try {
            const calculation = new Calculation({ operation, number1, number2, result });
            await calculation.save();
            console.log("Calculation saved");
          } catch (err) {
            console.log("Error saving calculation", err);
          }
        res.json({result});
    }
})

app.post("/modulo", async(req, res) => {
    const {operation, number1, number2} = req.body;
    const error = validateNumbers(number1, number2);
    if(error){
        logger.log({
            level: 'error',
            message:`Error in modulo operation: ${error}`
        })
    return res.status(400).json({error});
    }else{
        const result = number1 % number2;
        logger.log({
            level: 'info',
            message: `New modulo operation requested`
        })

        try {
            const calculation = new Calculation({ operation, number1, number2, result });
            await calculation.save();
            console.log("Calculation saved");
          } catch (err) {
            console.log("Error saving calculation", err);
          }
        res.json({result});
    }
})

app.post("/square-root", async (req,res) => {
    const {operation, number1} = req.body;
   if(isNaN(number1)) { //Makes sure the user enters a number
    logger.log({
        level: 'error',
        message:'Invalid numbers provided"'
    })
    return res.status(400).json({error: 'Invalid number provided"'})
   }
   if(number1 < 0){ //Makes sure the number is not negative
    logger.log({
        level: 'error',
        message: "Cannot compute the square root of a negative number"
    })
    alert("Cannot compute the square root of a negative number");
    return res.status(400).json({error: 'Cannot compute the square root of a negative number'});
   }else{
    const result = Math.sqrt(number1);
    logger.log({
        level: 'info',
        message: `New square root operation requested`
    })

    try {
        const calculation = new Calculation({ operation, number1, result });
        await calculation.save();
        console.log("Calculation saved");
      } catch (err) {
        console.log("Error saving calculation", err);
      }

    res.json({result});
   }
})

//CRUD OPERATIONS
app.get('/calculations', async (req, res) => {
    try{
        const calculations = await Calculation.find().sort({ createdAt: -1});
        res.json(calculations);
    }catch (err) {
        logger.error("Error catching calculations:", err);
        res.status(500).json({error: "Failed to retrieve calculations"});
    }
});

app.get('/calculations/:id', async (req, res) => {
    try{
        const calc = await Calculation.findById(req.params.id);
        if(!calc){
            return res.status(400).json({error: "Calculation not found"});
    }
        res.json(calc);
    }
    catch(err){
        logger.error("Error retrieving calculation:", err);
        res.status(500).json({error: "Error retrieving calculation."})
    }
});

app.put('/calculations/:id', async (req, res) => {
    const {operation, number1, number2, result } = req.body;
    try{
        const updated = await Calculation.findByIdAndUpdate(
            req.params.id,
            {operation, number1, number2, result},
            {new: true, runValidators: true}
        );
        if(!updated){
            res.status(400).json({error: "Calculation not found"});
        }
        res.json(updated);
    }
    catch(err){
        logger.error("Error updating calculation:", err);
        res.status(500).json({error: "Error updating calculation."})
    }
})

app.delete('/calculations/:id', async (req, res) => {
    try{
        const deleted = await Calculation.findByIdAndDelete(req.params.id)
        if(!deleted){
            res.status(400).json({error: "Calculation not found"});
        }
        res.json({message: "Calculation deleted"});
    }
    catch(err){
        logger.error("Error deleting calculation:", err);
        res.status(500).json({error: "Error deleting calculation"})
    }
}
);

// Starts the server and listens on the specified port
app.listen(port, () => {
console.log(`Server is running on port ${port}`)
});

