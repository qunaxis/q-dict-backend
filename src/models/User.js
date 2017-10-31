import mongoose from 'mongoose'



const Schema = mongoose.Schema

let UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String
  },
  email: {
    type: String
  },
  vk_id: {
    type: Number
  }
});

let User = mongoose.model('user', UserSchema);



export default User