import { isObject } from "lodash";
import SocketWorker from "./SocketWorker"

export function socketConnection(params) {
  let userId = "";
  let companyId = "";
  if (isObject(params)) {
    if (isObject(params.user)) {
      companyId = params.user.companyId ?? companyId;
      userId = params.user.id ?? userId;
    }
    if (params.companyId !== undefined) {
      companyId = params.companyId;
    }
    if (params.userId !== undefined) {
      userId = params.userId;
    }
  }
 
  return SocketWorker(companyId,userId)
}
