import express from 'express';
import { createUser, googleLogin, loginUser, verifyUser ,getAllUsers, deleteUser, toggleBlockUser
  ,forgotPassword,resetPassword, verifyResetToken
 } from '../controllers/userController.js';
import jwt from 'jsonwebtoken';

const userRouter = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};


userRouter.post("/", createUser);
userRouter.post("/login", loginUser);
userRouter.post("/google", googleLogin);

userRouter.post("/", createUser);
userRouter.post("/login", loginUser);
userRouter.post("/google", googleLogin);

userRouter.get("/all", verifyToken, getAllUsers);
userRouter.delete("/:id", verifyToken, deleteUser);
userRouter.put("/:id/block", verifyToken, toggleBlockUser);
userRouter.get("/", verifyToken, verifyUser);

userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);
userRouter.get("/verify-reset-token/:token", verifyResetToken);


//export default userRouter;
export { userRouter as default, verifyToken };