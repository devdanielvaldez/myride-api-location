const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/location-sharing', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Esquema y modelo de Mongoose para un Viaje
const tripSchema = new mongoose.Schema({
  tripId: String,
  driverId: String,
  locations: [
    {
      latitude: Number,
      longitude: Number,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Trip = mongoose.model('Trip', tripSchema);

const busSchema = new mongoose.Schema({
  busId: String,
  name: String,
  pointA: String,
  pointB: String,
  pointALat: String,
  pointBLat: String,
  pointALong: String,
  pointBLong: String,
  horaSalida: String,
  locations: [
    {
      latitude: Number,
      longitude: Number,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Bus = mongoose.model('Bus', busSchema);

// Middleware para parsear el cuerpo de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

// Endpoint para iniciar un nuevo viaje
app.post('/trips', async (req, res) => {
  const { tripId, driverId } = req.body;
  let trip = String(tripId);
  let driver = String(driverId);
  const newTrip = new Trip({ tripId: trip, driverId: driver });
  await newTrip.save();
  res.status(201).send(newTrip);
});

app.post('/buses', async (req, res) => {
  try {
    const busData = req.body;
    const newBus = new Bus(busData);
    await newBus.save();
    res.status(201).json(newBus);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/buses', async (req, res) => {
  try {
    const findBus = await Bus.find();
    res.status(200).json(findBus);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/buses/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const findBus = await Bus.findById(id);
    res.status(200).json(findBus.locations[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/buses/:id', async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude } = req.body;
  const buses = await Bus.findById(id);
  if (buses) {
    if (buses.locations.length > 0) {
      buses.locations[buses.locations.length - 1] = { latitude, longitude, timestamp: new Date() };
    } else {
      buses.locations.push({ latitude, longitude, timestamp: new Date() });
    }
    await buses.save();
    res.status(200).send(buses);
  } else {
    res.status(404).send('Trip not found');
  }
});



// Endpoint para actualizar la ubicación de un viaje
app.put('/trips/:tripId/locations', async (req, res) => {
    const { tripId } = req.params;
    const { latitude, longitude } = req.body;
    const trip = await Trip.findOne({ tripId });
    if (trip) {
      if (trip.locations.length > 0) {
        trip.locations[trip.locations.length - 1] = { latitude, longitude, timestamp: new Date() };
      } else {
        trip.locations.push({ latitude, longitude, timestamp: new Date() });
      }
      await trip.save();
      res.status(200).send(trip);
    } else {
      res.status(404).send('Trip not found');
    }
  });

// ...

// Endpoint para obtener la ubicación de un viaje por tripId
app.get('/trips/:tripId/locations', async (req, res) => {
    const { tripId } = req.params;
    try {
      const trip = await Trip.findOne({ tripId });
      if (trip) {
        res.status(200).send(trip.locations[0]);
      } else {
        res.status(404).send('Trip not found');
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

// Iniciar el servidor
const PORT = process.env.PORT || 3230;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});