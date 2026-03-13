import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import User from "../models/User";
import { compare } from "bcryptjs";

const isSpecificAdmin = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.user || {};
  if (!id) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const isEmailOk = String(user.email).toLowerCase() === "admin@admin.com";
  const isPasswordOk = await compare("123456", user.passwordHash || "");

  if (!isEmailOk || !isPasswordOk) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  return next();
};

export default isSpecificAdmin;
