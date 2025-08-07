import express from "express";
import { addUser ,loginUser,forgetPassword,resetPassword,updatePassword} from "../controller/user.js";
import { addExpense,showExpense,deleteExpense,getPremiumExpense,downloadExpenses } from "../controller/expense.js";
import { authentication } from "../middleware/auth.js";
const router=express.Router();

router.get("/",(req,res)=>{
    res.send("home page")
})
router.post("/user/add",addUser)
router.post("/user/login",loginUser)
router.post('/user/forgetPassword', forgetPassword);
router.get('/password/reset-password/:token', resetPassword);
router.post('/password/update-password/:token', updatePassword);
router.post("/expense/addExpense",authentication,addExpense);
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

router.get("/expense/show",authentication,showExpense)
router.delete("/expense/delete/:id",authentication,deleteExpense)
router.get("/expense/premium/showLeaderBoard",authentication,getPremiumExpense)
router.get('/expense/download', authentication, downloadExpenses);
export default router;