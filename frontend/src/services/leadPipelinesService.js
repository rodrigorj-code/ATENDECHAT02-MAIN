import api from "./api";

const leadPipelinesService = {
  async list() {
    const { data } = await api.get("/lead-pipelines");
    return data;
  },
  async bulkSave(pipelines) {
    const { data } = await api.put("/lead-pipelines/bulk", { pipelines });
    return data;
  }
};

export default leadPipelinesService;
