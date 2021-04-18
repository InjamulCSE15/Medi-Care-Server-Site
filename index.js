const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ikwi0.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 5000;

app.get('/',(req, res) => {
    res.send('Hello World!')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("mediCare").collection("appointments");

  // Add Appointments: 

  app.post('/addAppointment', (req, res) => {
      const appointment = req.body;
      appointmentCollection.insertOne(appointment)
      .then(result => {
          res.send(result.insertedCount > 0)
      })
  })
  
  // Get all appointments to show in UI: 
  
  app.get('/userappointments', (req, res) => {
      appointmentCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
  })


  // Check appointment by date: 

  app.post('/appointmentsByDate', (req, res) => {
      const date = req.body;
      appointmentCollection.find({date: date.date})
      .toArray((err, documents) => {
          res.send(documents);
      })
  })

  // Add a service:

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const time = req.body.time;
    const price = req.body.price;
    const space = req.body.space;

    console.log(name, time, price, space, file);

    file.mv(`${__dirname}/services/${file.name}`, err => {
        if(err){
            console.log(err);
            return res.status(500).send({msg: 'Failed to upload Image'});
        }
        return res.send({name: file.name, path: `/${file.name}`})
    })


})

// Add a review: 

app.post('/addreview', (req, res) => {
  const file = req.files.file;
  const name = req.body.name;
  const post = req.body.post;
  const from = req.body.from;
  const contact = req.body.contact;

  console.log(name, post, from, contact, file);

  file.mv(`${__dirname}/services/${file.name}`, err => {
      if(err){
          console.log(err);
          return res.status(500).send({msg: 'Failed to upload Image'});
      }
      return res.send({name: file.name, path: `/${file.name}`})
  })


})


});


app.listen(process.env.PORT || port)