import { Pool } from "mysql2/promise";
import isSetting from "../@types/isSetting";
import { Setting } from "../@types/settings";
import { BaseError } from "../Errors";

export const patchSettinginDb = async (pool: Pool, newSetting: Setting): Promise<void> => {
    if (!isSetting(newSetting)) throw new BaseError("Invalid setting input", 400);
    await pool.query("UPDATE settings SET refresh_rate = ? WHERE user_id = ?", [
        newSetting.refresh_rate,
        newSetting.user_id,
    ]);
};
