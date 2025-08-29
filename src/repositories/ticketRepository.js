import { BaseRepository } from './baseRepository.js';
import { ticketModel } from '../dao/models/ticketModel.js';

// Extiendo la clase base para crear el repositorio de tickets
export class TicketRepository extends BaseRepository {
    constructor() {
        super(null); 
    }

    // Metodo para crear un ticket
    async createTicket(ticketData) {
        const ticket = new ticketModel(ticketData);
        await ticket.save();
        
        return await ticketModel.findById(ticket._id)
            .populate('products.product', 'title price');
    }

    // Metodo para obtener un ticket por su codigo
    async getTicketByCode(code) {
        const ticket = await ticketModel.findOne({ code })
            .populate('products.product', 'title price');
        return ticket;
    }

    // Metodo para obtener los tickets de un usuario
    async getTicketsByUser(email) {
        const tickets = await ticketModel.find({ purchaser: email })
            .populate('products.product', 'title price')
            .sort({ purchase_datetime: -1 });
        return tickets;
    }

    // Metodo para validar un ticket
    async validateTicket(token) {
        const recoveryToken = await ticketModel.findOne({ token });
        return recoveryToken && recoveryToken.isValid();
    }
}