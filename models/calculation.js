// Imports the Mongoose library to interact with MongoDB
const mongoose = require("mongoose");

// Defines the schema for storing calculator operations
const CalculationSchema = new mongoose.Schema({
  operation: String,          
  number1: Number,            
  number2: Number,            
  result: Number,             
  timestamp: {               
    type: Date,
    default: Date.now         
  }
});

// Exports the model so it can be used in other files to save and fetch calculations
module.exports = mongoose.model("Calculation", CalculationSchema);

