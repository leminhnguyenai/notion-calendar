const addDate = (date: string, ms: number): Date => {
    const newDate = new Date(date);
    newDate.setTime(newDate.getTime() + ms);
    return newDate;
};

export default addDate;
