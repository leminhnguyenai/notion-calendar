import { NotionConnection } from '../@types';

const splitTask = (
    tasks: NotionConnection[],
    limit: number,
): Array<NotionConnection[]> => {
    const bulks: Array<NotionConnection[]> = [];
    let bulkNo = 0;
    while (bulkNo <= Math.floor(tasks.length / limit) + 1) {
        const start = limit;
        const end = start + limit > tasks.length ? undefined : start + limit;
        const bulk: NotionConnection[] = tasks.slice(start, end);
        bulks.push(bulk);
        bulkNo++;
    }

    return bulks;
};

export default splitTask;
