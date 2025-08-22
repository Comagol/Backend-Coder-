
export class UserDTO {
  constructor(user) {
    this.id = user_id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.role = user.role;
    this.age = user.age;
    this.cart = user.cart;
  }

  //metodo estatico para crear DTO desde un documento Mongodb
  static fromUser(user) {
    return new UserDTO(user);
  }

  static getPublicInfo(user) {
    return {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role
    }
  }
}