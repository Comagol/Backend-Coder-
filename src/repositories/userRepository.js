import { BaseRepository } from './baseRepository.js';
import { userModel } from '../dao/models/userModel.js';
import { UserDTO } from '../dto/userDTO.js';
import { UserUtils } from '../utils/userUtils.js';

// Extiendo la clase base para crear el repositorio de usuarios
export class UserRepository extends BaseRepository {
    constructor() {
        super(null); // No hay DAO específico para usuarios
    }

    // Metodo para obtener un usuario por su email
    async findUserByEmail(email) {
        const user = await userModel.findOne({ email });
        return user ? UserDTO.fromUser(user) : null;
    }

    // Metodo para obtener un usuario por su id
    async findUserById(id) {
        const user = await userModel.findById(id).select('-password');
        return user ? UserDTO.fromUser(user) : null;
    }

    // Metodo para crear un usuario
    async createUser(userData) {
        // Valido datos antes de crear
        UserUtils.validateUserData(userData);
        
        const user = new userModel(userData);
        await user.save();
        
        return UserDTO.fromUser(user);
    }

    // Metodo para actualizar un usuario
    async updateUser(id, userData) {
        const user = await userModel.findByIdAndUpdate(id, userData, { new: true });
        return user ? UserDTO.fromUser(user) : null;
    }

    // Metodo para obtener la informacion publica de un usuario
    async getPublicUserInfo(id) {
        const user = await userModel.findById(id).select('-password');
        return user ? UserUtils.getPublicInfo(user) : null;
    }
}