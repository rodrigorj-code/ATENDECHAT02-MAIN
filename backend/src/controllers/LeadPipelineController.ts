import { Request, Response } from "express";
import { Op } from "sequelize";
import LeadPipeline from "../models/LeadPipeline";
import LeadPipelineStage from "../models/LeadPipelineStage";
import AppError from "../errors/AppError";

export default {
  async list(req: Request, res: Response): Promise<Response> {
    const { companyId } = req.user;
    const pipelines = await LeadPipeline.findAll({
      where: { companyId },
      include: [{ model: LeadPipelineStage, as: "stages", separate: true, order: [["order", "ASC"]] }],
      order: [["id", "ASC"]]
    });
    return res.json(pipelines.map(p => ({
      id: p.id,
      name: p.name,
      stages: (p.stages || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map(s => ({
        id: s.id, key: s.key, label: s.label, color: s.color, order: s.order
      }))
    })));
  },

  async bulkSave(req: Request, res: Response): Promise<Response> {
    const { companyId, profile, super: isSuper } = req.user;
    if (profile !== "admin" && !isSuper) throw new AppError("ERR_NO_PERMISSION", 403);

    const { pipelines } = req.body as {
      pipelines: Array<{ id?: any; name: string; stages: Array<{ id?: any; key: string; label: string; color: string; order?: number }> }>;
    };
    if (!Array.isArray(pipelines)) throw new AppError("ERR_INVALID_PARAM", 400);

    const existing = await LeadPipeline.findAll({ where: { companyId } });
    const existingIds = new Set(existing.map(p => p.id));

    const incomingIds = new Set<number>();

    // Upsert pipelines
    for (const p of pipelines) {
      if (!p?.name) continue;
      if (!Array.isArray(p.stages)) p.stages = [];
      const parsedId = typeof p.id === "number" ? p.id : Number(p.id);
      const hasValidId = Number.isInteger(parsedId) && parsedId > 0;

      let model: LeadPipeline;
      if (hasValidId) {
        model = await LeadPipeline.findOne({ where: { id: parsedId, companyId } });
        if (model) {
          model.name = p.name;
          await model.save();
        } else {
          model = await LeadPipeline.create({ id: parsedId, name: p.name, companyId } as any);
        }
        incomingIds.add(model.id);
      } else {
        model = await LeadPipeline.create({ name: p.name, companyId });
        p.id = model.id;
        incomingIds.add(model.id);
      }

      // Upsert stages
      const stagesExisting = await LeadPipelineStage.findAll({ where: { pipelineId: model.id, companyId } });
      const stageExistingIds = new Set(stagesExisting.map(s => s.id));
      const stageIncomingIds: number[] = [];

      let order = 0;
      for (const st of p.stages || []) {
        order += 1;
        const parsedStageId = typeof st.id === "number" ? st.id : Number(st.id);
        const stageHasValidId = Number.isInteger(parsedStageId) && parsedStageId > 0;
        if (stageHasValidId) {
          const m = await LeadPipelineStage.findOne({ where: { id: parsedStageId, pipelineId: model.id, companyId } });
          if (m) {
            m.key = st.key.toLowerCase();
            m.label = st.label;
            m.color = st.color;
            m.order = order;
            await m.save();
            stageIncomingIds.push(m.id);
          } else {
            const created = await LeadPipelineStage.create({
              id: parsedStageId,
              pipelineId: model.id,
              key: st.key.toLowerCase(),
              label: st.label,
              color: st.color,
              order,
              companyId
            } as any);
            stageIncomingIds.push(created.id);
          }
        } else {
          const created = await LeadPipelineStage.create({
            pipelineId: model.id,
            key: st.key.toLowerCase(),
            label: st.label,
            color: st.color,
            order,
            companyId
          });
          stageIncomingIds.push(created.id);
        }
      }

      // Remove deleted stages
      const toRemove = [...stageExistingIds].filter(id => !stageIncomingIds.includes(id));
      if (toRemove.length) {
        await LeadPipelineStage.destroy({ where: { id: { [Op.in]: toRemove }, pipelineId: model.id, companyId } });
      }
    }

    // Remove deleted pipelines
    const toRemovePipelines = [...existingIds].filter(id => !incomingIds.has(id));
    if (toRemovePipelines.length) {
      await LeadPipelineStage.destroy({ where: { pipelineId: { [Op.in]: toRemovePipelines }, companyId } });
      await LeadPipeline.destroy({ where: { id: { [Op.in]: toRemovePipelines }, companyId } });
    }

    const out = await LeadPipeline.findAll({
      where: { companyId },
      include: [{ model: LeadPipelineStage, as: "stages", separate: true, order: [["order", "ASC"]] }],
      order: [["id", "ASC"]]
    });

    return res.status(200).json(out.map(p => ({
      id: p.id,
      name: p.name,
      stages: (p.stages || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map(s => ({
        id: s.id, key: s.key, label: s.label, color: s.color, order: s.order
      }))
    })));
  }
};
