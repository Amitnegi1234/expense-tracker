import User from "./user.js";
import Expense from "./expense.js";
import ForgotPasswordRequest from "./forgetPassword.js";

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User);   


export {User,Expense,ForgotPasswordRequest};