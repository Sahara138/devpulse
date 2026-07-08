import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();


router.post('/signup',authController.signupUser)
router.post('/login',authController.loginUser)

router.get("/test-db", async (req, res) => {
  const result = await pool.query("SELECT * FROM users");
  res.json(result.rows);
});
// router.post('/refresh-token',authController.refreshToken)

export const authRoute = router;