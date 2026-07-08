const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({

    fileName:String,

    totalRows:Number,

    importedRows:Number,

    skippedRows:Number

},
{
    timestamps:true
});

module.exports = mongoose.model("Upload",uploadSchema);