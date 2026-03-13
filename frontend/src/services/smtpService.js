import api from "./api";

const smtpService = {
  list: async () => {
    const { data } = await api.request({
      url: "/smtp-configs",
      method: "GET"
    });
    return data;
  },
  create: async (payload) => {
    const { data } = await api.request({
      url: "/smtp-configs",
      method: "POST",
      data: payload
    });
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.request({
      url: `/smtp-configs/${id}`,
      method: "PUT",
      data: payload
    });
    return data;
  },
  remove: async (id) => {
    const { data } = await api.request({
      url: `/smtp-configs/${id}`,
      method: "DELETE"
    });
    return data;
  },
  setDefault: async (id) => {
    const { data } = await api.request({
      url: `/smtp-configs/${id}/default`,
      method: "POST"
    });
    return data;
  }
};

export default smtpService;

