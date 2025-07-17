import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  email : {
    type : String,
    required : true,
    unique : true
  },
  firstName : {
    type : String,
    required : true
  },
  lastName : {
    type : String,
    required : true
  },
  password : {
    type : String,
    required : true
  },
  isBlocked : {
    type : Boolean,
    default : false
  },
  type : {
    type : String,
    default : "customer"
  },
  profilePicture : {
    type : String,
    default : "https://static.vecteezy.com/system/resources/thumbnails/048/926/072/small_2x/gold-membership-icon-default-avatar-profile-icon-membership-icon-social-media-user-image-illustration-vector.jpg"
  }
})

const User = mongoose.model("users",userSchema)

export default User;