import jwt from "jsonwebtoken";


export const generateToken =({
  publicClaims,
  secretKey=process.env.JWT_SECRET_KEY,
  registeredClaims,
})=>{
    return jwt.sign(publicClaims, secretKey, registeredClaims)
  }
  
  
  export const verifyToken = ({token, secretKey=process.env.JWT_SECRET_KEY})=>{
    return jwt.verify(token, secretKey)
  }


