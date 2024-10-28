function isSetting(obj) {
    return ("user_id" in obj &&
        typeof obj.user_id == "number" &&
        "refresh_rate" in obj &&
        typeof obj.refresh_rate == "number");
}
export default isSetting;
