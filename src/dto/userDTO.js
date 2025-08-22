
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
}