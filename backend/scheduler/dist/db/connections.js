import { isFormattedConn } from "../@types/isFormattedConn";
import { BaseError } from "../Errors";
export const postConnToDb = async (pool, newConn) => {
    if (!isFormattedConn(newConn))
        throw new BaseError("Invalid input connection", 400);
    await pool.query("INSERT INTO connections VALUES(?,?,?,?,?,?,?)", [
        newConn.calendarId,
        newConn.calendarName,
        JSON.stringify(newConn.date),
        JSON.stringify(newConn.name),
        JSON.stringify(newConn.description) || null,
        JSON.stringify(newConn.doneMethod) || null,
        JSON.stringify(newConn.doneMethodOption) || null,
    ]);
};
export const patchConnInDb = async (pool, updatedConn) => {
    if (!isFormattedConn(updatedConn))
        throw new BaseError("Invalid input connection", 400);
    await pool.query("UPDATE connections SET calendar_name = ?, date = ?, name = ?, description = ?, done_method = ?, done_method_option = ? WHERE calendar_id = ?", [
        updatedConn.calendarName,
        JSON.stringify(updatedConn.date),
        JSON.stringify(updatedConn.name),
        JSON.stringify(updatedConn.description) || null,
        JSON.stringify(updatedConn.doneMethod) || null,
        JSON.stringify(updatedConn.doneMethodOption) || null,
        updatedConn.calendarId,
    ]);
};
export const deleteConnInDb = async (pool, deletedCalendarId) => {
    await pool.query("DELETE FROM connections WHERE calendar_id = ?", [deletedCalendarId]);
};
