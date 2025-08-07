import {  DataTypes } from "sequelize";
import { db } from "../utils/db.js";
import { v4 as uuidv4 } from "uuid";

const ForgotPasswordRequest = db.define("forgotPasswordRequest", {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },
  isactive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});
export default ForgotPasswordRequest;
