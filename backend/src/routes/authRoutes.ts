import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/authentication";
import { Permission, UserRole } from "../middleware/authorization";

interface AuthenticatedResponseBody {
  success: boolean;
  user?: {
    userId: string;
    role: UserRole;
    permissions: Permission[];
    sessionId?: string;
  };
  sessionId?: string;
}

const router = Router();

router.get(
  "/me",
  authenticateToken,
  (req: Request, res: Response<AuthenticatedResponseBody>) => {
    if (!req.user) {
      res.status(401).json({ success: false });
      return;
    }

    res.json({
      success: true,
      user: {
        userId: req.user.userId,
        role: req.user.role,
        permissions: req.user.permissions,
        sessionId: req.user.sessionId,
      },
      sessionId: req.user.sessionId,
    });
  },
);

export default router;
