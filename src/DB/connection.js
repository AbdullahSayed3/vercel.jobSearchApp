import mongoose from "mongoose";

export const databaseConnection = async()=>{
  try {
      await mongoose.connect(process.env.DB_URI_LOCAL)
        console.log("Database connected successfully.")
  } catch (error) {
    console.log("Error connecting to database",error)
  }
}