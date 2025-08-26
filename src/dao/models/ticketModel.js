import mongoose from 'mongoose';

//creo el nombre de la coleccion
const ticketCollection = 'tickets';

//defino el esquema de la coleccion
const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  purchase_datetime: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true
  },
  purchaser: {
    type: String,
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'products'
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      }
  }],
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
});

//middleware para generar el codigo del ticket
ticketSchema.pre('save', function(next) {
  if (!this.code) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.code = `TICKET${timestamp}${random}`;
  }
  next();
});

export const ticketModel = mongoose.model(ticketCollection, ticketSchema);