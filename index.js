const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');
const Management=require('./Models/Management');
const Hostel = require('./Models/HostelModel'); 
const app = express();
app.use(bodyParser.json());
app.use(cors());

const accountSid = 'AC728058fbd1c2a1005d91351c823a324c';
const authToken = 'c2702d6a246a366003a8fe38153ac182';
const client = new twilio(accountSid, authToken);

const uri = 'mongodb+srv://manu21:manu292004@cluster0.njnjb24.mongodb.net/testdb?retryWrites=true&w=majority';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
})
.catch((err) => {
  console.log('Error connecting to MongoDB Atlas:', err);
});



app.post('/students', async (req, res) => {
  const { rollno, hostelid, name, phone_no, parent_name, parent_phone } = req.body;

  if (!rollno || !hostelid || !name || !phone_no || !parent_name || !parent_phone) {
    return res.status(400).send('All fields are required');
  }

  try {
    const newStudent = new Hostel({ rollno, hostelid, name, phone_no, parent_name, parent_phone });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    console.error('Error creating student:', err);
    res.status(500).send('Server error');
  }
});



app.post('/request-permission/:rollno', async (req, res) => {
  const { hostelid } = req.body;
  const {rollno}=req.body;

  const newRequest = new Management({
    request_id: new mongoose.Types.ObjectId(),
    rollno:rollno,
    hostelid: hostelid,
    approved: false
  });

  await newRequest.save();
  res.status(200).send('Permission requested');
});


app.post('/approve-permission/:rollno', async (req, res) => {
  const { hostelid } = req.body;

  const request = await Management.findOne({ hostelid: hostelid });

  if (request) {
    request.approved = true;
    request.returned=false;
  
    request.approval_time = new Date();
    await request.save();

    const hosteler = await Hostel.findOne({ hostelid: request.hostelid });

    if (hosteler) {
      hosteler.isinout = false; 
      await hosteler.save();

      client.messages.create({
        body: `Your child, ${hosteler.name}, has been granted permission to leave the hostel.`,
        from: '+18543549263',
        to: hosteler.parent_phone
      }).then((message) => console.log(message.sid));

      res.status(200).send('Permission approved and parent notified');
    } else {
      res.status(404).send('Hosteler not found');
    }
  } else {
    res.status(404).send('Permission request not found');
  }
});

app.post('/student-return', async (req, res) => {
  const { rollno, hostelid } = req.body;

  try {
     const request = await Management.findOne({ rollno: rollno });
    console.log(request)
     if (request && request.approved && !request.returned) {
       request.returned = true;
      request.return_time = new Date();
      await request.save();

        const student = await Hostel.findOne({ rollno: rollno });

       if (student) {
         student.isinout = true;
        await student.save();

         client.messages.create({
          body: `Your child, ${student.name}, has returned to the hostel.`,
          from: '+18543549263',
          to: student.parent_phone
        }).then((message) => console.log(message.sid));

        res.status(200).send('Student return recorded and parent notified');
      } else {
        res.status(404).send('Student not found');
      }
    } else {
      res.status(404).send('Permission request not found or already returned');
    }
  } catch (err) {
    console.error('Error recording student return:', err);
    res.status(500).send('Server error');
  }
});



const port = 5000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});