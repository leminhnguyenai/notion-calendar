import isSetting from "../@types/isSetting";
import { BaseError } from "../Errors";
import db from "../db/db";
const patchSetting = async (newSetting) => {
    if (!isSetting(newSetting))
        throw new BaseError("Invalid setting", 400);
    await db.relation.patch(newSetting);
    return {};
};
export default patchSetting;
