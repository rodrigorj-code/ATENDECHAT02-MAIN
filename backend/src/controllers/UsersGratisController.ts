import { Request, Response } from "express";
import { Op } from "sequelize";
import Company from "../models/Company";
import User from "../models/User";

/**
 * Lista organizações criadas pelo cadastro grátis (freemium), com admin e metadados.
 */
export const index = async (req: Request, res: Response): Promise<Response> => {
  const profile = (req.user as any)?.profile;
  if (profile !== "admin") {
    return res.status(403).json({ error: "FORBIDDEN" });
  }

  const { dateFrom, dateTo, uf } = req.query as {
    dateFrom?: string;
    dateTo?: string;
    uf?: string;
  };

  const where: any = { recurrence: "freemium" };

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      where.createdAt[Op.lte] = end;
    }
  }

  const companies = await Company.findAll({
    where,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["id", "name", "email", "phone", "profile", "createdAt"],
        required: false
      }
    ]
  });

  const ufNorm = uf ? String(uf).trim().toUpperCase() : "";

  const rows = companies
    .map(c => {
      const meta = (c as any).signupMetadata as Record<string, any> | null | undefined;
      const address = meta?.address || {};
      const users = ((c as any).users || []) as User[];
      const admin = users.find((u: User) => u.profile === "admin") || users[0] || null;
      return {
        companyId: c.id,
        companyName: c.name,
        companyEmail: c.email,
        companyPhone: c.phone,
        document: c.document,
        createdAt: c.createdAt,
        dueDate: c.dueDate,
        uf: address.uf || "",
        cidade: address.cidade || "",
        niche: meta?.niche || "",
        adminName: admin?.name || "",
        adminEmail: admin?.email || "",
        adminPhone: admin?.phone || "",
        signupMetadata: meta || null
      };
    })
    .filter(r => {
      if (!ufNorm) return true;
      return String(r.uf || "").toUpperCase() === ufNorm;
    });

  return res.json({ records: rows, count: rows.length });
};
