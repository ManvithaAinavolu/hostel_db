const mongoose = require('mongoose');
const Hostel=require('./HostelModel')
const managementSchema = new mongoose.Schema({
    request_id: String,
    rollno: {
      type: String,
      required: true,
      ref: Hostel
    },
    hostelid: String,
    approved: Boolean,
    request_time: { type: Date, default: Date.now },
    approval_time: Date,
    return_time: Date,
    returned: { type: Boolean, default: false }
});

const Management = mongoose.model('Management', managementSchema);
module.exports = Management;
