import isSetting from "../@types/isSetting";
import { BaseError } from "../Errors";
export const patchSettinginDb = async (pool, newSetting) => {
    if (!isSetting(newSetting))
        throw new BaseError("Invalid setting input", 400);
    await pool.query("UPDATE settings SET refresh_rate = ? WHERE user_id = ?", [
        newSetting.refresh_rate,
        newSetting.user_id,
    ]);
};
