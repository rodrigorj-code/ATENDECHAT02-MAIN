import { Request, Response } from "express";
import * as Yup from "yup";
import Project from "../models/Project";
import Activity from "../models/Activity";
import AppError from "../errors/AppError";
import User from "../models/User";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { pageNumber, searchParam } = req.query;

  const whereCondition = {
    companyId
  };

  if (searchParam) {
    // Add search logic if needed
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: projects } = await Project.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      { model: Activity, as: "activities" },
      { model: User, as: "user", attributes: ["id", "name", "email"] }
    ]
  });

  const hasMore = count > offset + projects.length;

  return res.json({ projects, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: currentUserId } = req.user;
  const data = req.body;

  const schema = Yup.object().shape({
    name: Yup.string().required()
  });

  try {
    await schema.validate(data);
  } catch (err) {
    throw new AppError(err.message);
  }

  const project = await Project.create({
    ...data,
    companyId,
    userId: data.userId || currentUserId
  });

  // Se houver atividades para vincular
  if (data.activityIds && data.activityIds.length > 0) {
    await Activity.update(
      { projectId: project.id },
      { where: { id: data.activityIds, companyId } }
    );
  }

  return res.status(200).json(project);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body;
  const { projectId } = req.params;

  const project = await Project.findOne({
    where: { id: projectId, companyId }
  });

  if (!project) {
    throw new AppError("ERR_NO_PROJECT_FOUND", 404);
  }

  await project.update(data);

  // Atualizar atividades vinculadas
  if (data.activityIds) {
    // Primeiro desvincula todas (opcional, dependendo da lógica de negócio)
    // await Activity.update({ projectId: null }, { where: { projectId: project.id } });
    
    // Vincula as novas
    if (data.activityIds.length > 0) {
        await Activity.update(
            { projectId: project.id },
            { where: { id: data.activityIds, companyId } }
        );
    }
  }

  await project.reload({
      include: [
        { model: Activity, as: "activities" },
        { model: User, as: "user", attributes: ["id", "name", "email"] }
      ]
  });

  return res.status(200).json(project);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { projectId } = req.params;

  const project = await Project.findOne({
    where: { id: projectId, companyId }
  });

  if (!project) {
    throw new AppError("ERR_NO_PROJECT_FOUND", 404);
  }

  await project.destroy();

  return res.status(200).json({ message: "Project deleted" });
};
