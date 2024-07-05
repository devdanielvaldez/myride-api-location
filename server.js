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