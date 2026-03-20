/** 
 * @TercioSantos-1 |
 * api/get/todas as configurações de 1 empresa |
 * api/get/1 configuração específica |
 * api/put/atualização de 1 configuração |
 */
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useCompanySettings = () => {

    const getAll = async (companyId) => {
        if (!companyId) return {};
        try {
            const { data } = await api.request({
                url: `/companySettings/${companyId}`,
                method: 'GET'
            });
            return data != null && typeof data === "object" && !Array.isArray(data) ? data : {};
        } catch (err) {
            toastError(err);
            return {};
        }
    }

   const get = async (params) => {
        try {
            const { data } = await api.request({
                url: '/companySettingOne',
                method: 'GET',
                params
            });
            return data;
        } catch (err) {
            toastError(err);
            return {};
        }
    } 

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: '/companySettings',
            method: 'PUT',
            data
        });
        return responseData;
    }

    return {
        getAll,
        get,
        update
    }
}

export default useCompanySettings;