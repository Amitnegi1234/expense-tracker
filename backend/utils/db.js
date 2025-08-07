import dotenv from "dotenv";
dotenv.config({quiet:true});
import { Sequelize } from "sequelize";

const sequelize=new Sequelize(process.env.DB_NAME,process.env.DB_USERNAME,process.env.DB_PASSWORD,{
    host:process.env.HOST_NAME,
    dialect:'mysql',
    logging: false
});

(async()=>{
    try {
        await sequelize.authenticate();
        console.log("database connected");
    } catch (error) {
        console.log(error);
    }
})()
export const db=sequelize;