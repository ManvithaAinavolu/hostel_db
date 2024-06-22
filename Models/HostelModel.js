const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollno: {
    type: String,
    required: true,
    unique: true
  },
  hostelid: {
    type: String,
   
 
  },
  name: {
    type: String,
    required: true
  },
  phone_no: {
    type: String,
    required: true
  },
  parent_name: {
    type: String,
    required: true
  },
  parent_phone: {
    type: String,
    required: true
  },
  isinout: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Student', studentSchema);
