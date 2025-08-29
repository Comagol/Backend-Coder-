// Creo la clase base para todos los repositories
export class BaseRepository {
  constructor(dao) {
      this.dao = dao;
  }

  async getAll(params = {}) {
      return await this.dao.getAll(params);
  }

  async getById(id) {
      return await this.dao.getById(id);
  }

  async create(data) {
      return await this.dao.create(data);
  }

  async update(id, data) {
      return await this.dao.update(id, data);
  }

  async delete(id) {
      return await this.dao.delete(id);
  }
}