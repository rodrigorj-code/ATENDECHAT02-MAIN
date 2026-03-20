import api, { openApi } from "../../services/api";
import toastError from "../../errors/toastError";

const emptyPlanPayload = { plan: {} };

const usePlans = () => {

    const getPlanList = async (params) => {
        const { data } = await openApi.request({
            url: '/public/plans',
            method: 'GET',
            params
        });
        return data;
    }

    const list = async (params) => {
        const { data } = await api.request({
            url: '/plans/all',
            method: 'GET',
            params
        });
        return data;
    }

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/plans',
            method: 'POST',
            data
        });
        return responseData;
    }

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/plans/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/plans/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    const getPlanCompany = async (params, id) => {
        if (!id) {
            return emptyPlanPayload;
        }
        try {
            const { data } = await api.request({
                url: `/companies/listPlan/${id}`,
                method: 'GET',
                params
            });
            return data && typeof data === "object" ? data : emptyPlanPayload;
        } catch (err) {
            toastError(err);
            return emptyPlanPayload;
        }
    }

    return {
        getPlanList,
        list,
        save,
        update,
        remove,
        getPlanCompany
    }
}

export default usePlans;
