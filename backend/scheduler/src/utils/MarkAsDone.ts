import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { BaseError } from "../Errors";

class MarkAsDone {
    private pageObj: PageObjectResponse;
    constructor(page: PageObjectResponse) {
        this.pageObj = page;
    }

    getDoneStatus(name: string, optId?: string): string {
        const propertyType = this.pageObj.properties[name].type;
        switch (propertyType) {
            case "checkbox":
                return this.getCheckbox(name);
            case "select":
                if (!optId) throw new BaseError("No Id provided for select option", 400);
                return this.getSelect(name, optId);
            case "status":
                if (!optId) throw new BaseError("No Id provided for select option", 400);
                return this.getStatus(name, optId);
        }
        return "";
    }

    private getCheckbox(name: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "checkbox") throw new BaseError("Invalid notion data", 400);
        return property.checkbox ? "✅ " : "";
    }

    private getSelect(name: string, optId: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "select") throw new BaseError("Invalid notion data", 400);
        const selectId = property.select?.id;
        if (!selectId) return "";
        return selectId == optId ? "✅ " : "";
    }

    private getStatus(name: string, optId: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "status") throw new BaseError("Invalid notion data", 400);
        const statusId = property.status?.id;
        if (!statusId) return "";
        return statusId == optId ? "✅ " : "";
    }
}

export default MarkAsDone;
