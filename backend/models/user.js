import { DataTypes } from "sequelize";
import { db } from "../utils/db.js";

const User = db.define('loginUsers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    totalExpense: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isPremium: { 
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
})

export default User;