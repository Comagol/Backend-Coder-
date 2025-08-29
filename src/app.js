import express from 'express';
import handlebars from 'express-handlebars';
import {Server} from 'socket.io';
import mongoose from 'mongoose';
import passport from 'passport';
import dotenv from 'dotenv';

import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import sessionRouter from './routes/sessionRouter.js';
import ticketRouter from './routes/ticketRouter.js';
import __dirname from './utils/constantsUtil.js';
import websocket from './websocket.js';
import recoveryRouter from './routes/recoveryRouter.js';

import './config/passport.config.js';

const app = express();
dotenv.config({
    path: './.env',
    override: true
});

const uri = process.env.MONGODB_URI || 'mongodb+srv://coderhouse:codercoder2023@cluster0.wpxpupc.mongodb.net/entrega-final?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri);

//Handlebars Config
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/../views');
app.set('view engine', 'handlebars');

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

// Middlewares de Passport
app.use(passport.initialize());

//Routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/tickets', ticketRouter);
app.use('/', viewsRouter);
app.use('/api/recovery', recoveryRouter);

const PORT = process.env.PORT || 8080;
const httpServer = app.listen(PORT, () => {
    console.log(`Start server in PORT ${PORT}`);
});

const io = new Server(httpServer);

websocket(io);