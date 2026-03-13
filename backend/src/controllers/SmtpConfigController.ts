import { Request, Response } from "express";
import SmtpConfig from "../models/SmtpConfig";
import AppError from "../errors/AppError";
import { verifyCredentials } from "../helpers/SmtpTransport";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const items = await SmtpConfig.findAll({ where: { companyId }, order: [["isDefault", "DESC"], ["createdAt", "DESC"]] });
  return res.json({ items });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { smtpHost, smtpPort, smtpUsername, smtpPassword, smtpEncryption, isDefault } = req.body;

  if (!smtpHost || !smtpPort) {
    throw new AppError("INVALID_SMTP_CONFIG", 400);
  }

  try {
    await verifyCredentials({ smtpHost, smtpPort, smtpUsername, smtpPassword, smtpEncryption });
  } catch {
    /* noop */
  }

  if (isDefault) {
    await SmtpConfig.update({ isDefault: false }, { where: { companyId } });
  }

  const item = await SmtpConfig.create({
    companyId,
    smtpHost,
    smtpPort,
    smtpUsername,
    smtpEncryption: smtpEncryption || "tls",
    isDefault: !!isDefault
  } as any);

  if (smtpPassword) {
    (item as any).smtpPassword = smtpPassword;
    await item.save();
  }

  return res.status(201).json(item);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params as any;
  const item = await SmtpConfig.findOne({ where: { id, companyId } });
  if (!item) throw new AppError("SMTP_CONFIG_NOT_FOUND", 404);

  const { smtpHost, smtpPort, smtpUsername, smtpPassword, smtpEncryption, isDefault } = req.body;

  if (smtpHost || smtpPort || smtpUsername || smtpPassword || smtpEncryption) {
    try {
      await verifyCredentials({
        smtpHost: smtpHost || item.smtpHost,
        smtpPort: smtpPort || item.smtpPort,
        smtpUsername: smtpUsername || item.smtpUsername,
        smtpPassword: smtpPassword || item.smtpPassword,
        smtpEncryption: smtpEncryption || item.smtpEncryption
      });
    } catch {
      /* noop */
    }
  }

  if (isDefault) {
    await SmtpConfig.update({ isDefault: false }, { where: { companyId } });
  }

  await item.update({
    smtpHost: smtpHost ?? item.smtpHost,
    smtpPort: smtpPort ?? item.smtpPort,
    smtpUsername: smtpUsername ?? item.smtpUsername,
    smtpEncryption: smtpEncryption ?? item.smtpEncryption,
    isDefault: isDefault ?? item.isDefault
  });

  // Não apagar senha quando vier string vazia; somente atualizar se houver conteúdo
  if (smtpPassword !== undefined && smtpPassword !== "") {
    (item as any).smtpPassword = smtpPassword;
    await item.save();
  }

  return res.json(item);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params as any;
  const item = await SmtpConfig.findOne({ where: { id, companyId } });
  if (!item) throw new AppError("SMTP_CONFIG_NOT_FOUND", 404);

  await item.destroy();
  return res.status(204).send();
};

export const setDefault = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params as any;
  const item = await SmtpConfig.findOne({ where: { id, companyId } });
  if (!item) throw new AppError("SMTP_CONFIG_NOT_FOUND", 404);

  await SmtpConfig.update({ isDefault: false }, { where: { companyId } });
  await item.update({ isDefault: true });
  return res.json(item);
};
