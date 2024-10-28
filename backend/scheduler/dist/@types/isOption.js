function isOption(obj) {
    return (typeof obj == "object" &&
        obj !== null &&
        obj.name !== undefined &&
        obj.value !== undefined);
}
export default isOption;
