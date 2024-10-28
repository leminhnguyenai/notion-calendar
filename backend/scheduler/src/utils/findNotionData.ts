import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { BaseError } from "../Errors";

class FindNotionData {
    private pageObj: PageObjectResponse;
    constructor(page: PageObjectResponse) {
        this.pageObj = page;
    }

    getData(name: string, date?: "start" | "end"): string {
        const propertyType = this.pageObj.properties[name].type;
        switch (propertyType) {
            case "title":
                return this.getTitle(name);
            case "formula":
                return this.getFormula(name);
            case "rich_text":
                return this.getRichText(name);
            case "email":
                return this.getEmail(name);
            case "files":
                return this.getFiles(name);
            case "select":
                return this.getSelect(name);
            case "multi_select":
                return this.getMultiSelect(name);
            case "people":
                return this.getPeople(name);
            case "phone_number":
                return this.getPhoneNumber(name);
            case "status":
                return this.getStatus(name);
            case "url":
                return this.getUrl(name);
            case "date":
                if (!date) throw new BaseError("No specific end date or start date specified", 400);
                if (date == "start") return this.getStartDate(name);
                else if (date == "end") return this.getEndDate(name);
        }
        return "";
    }

    private getTitle(name: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "title") throw new BaseError("Invalid notion data", 400);
        return property.title[0].plain_text;
    }

    private getFormula(name: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "formula") throw new BaseError("Invalid notion data", 400);
        const contentType = property.formula.type;
        switch (contentType) {
            case "boolean": {
                const bool: boolean | null = property.formula.boolean;
                if (!bool) return "";
                return bool ? "✅" : "❌";
            }
            case "date": {
                const startDate: string | undefined = property.formula.date?.start;
                const endDate: string | undefined | null = property.formula.date?.end;
                if (!startDate && !endDate) return "";
                else if (startDate && !endDate) return `Start date: ${startDate}`;
                else if (!startDate && endDate) return `End date: ${endDate}`;
                else return `Schedule: ${startDate} → ${endDate}`;
            }
            case "number": {
                const num: number | null = property.formula.number;
                if (!num) return "";
                return num.toString();
            }
            case "string": {
                const string: string | null = property.formula.string;
                if (!string) return "";
                return string;
            }
        }
    }

    private getRichText(name: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "rich_text") throw new BaseError("Invalid notion data", 400);
        return property.rich_text[0].plain_text;
    }

    private getEmail(name: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "email") throw new BaseError("Invalid notion data", 400);
        return property.email || "";
    }

    private getFiles(name: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "files") throw new BaseError("Invalid notion data", 400);
        const urls: string[] = property.files.map((fileObj) => {
            if (fileObj.type == "external") return fileObj.external.url;
            else if (fileObj.type == "file") return fileObj.file.url;
            else return "";
        });
        return urls.join(" ");
    }

    private getSelect(name: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "select") throw new BaseError("Invalid notion data", 400);
        return property.select?.name || "";
    }

    private getMultiSelect(name: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "multi_select") throw new BaseError("Invalid notion data", 400);
        const multiSelect = property.multi_select;
        if (multiSelect.length == 0) return "";
        return multiSelect.map((option) => option.name).join(", ");
    }

    private getPeople(name: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "people") throw new BaseError("Invalid notion data", 400);
        const peopleList = property.people;
        if (peopleList.length == 0) return "";
        return peopleList
            .map((person) => {
                if ("type" in person && person.type == "person") return person.name;
            })
            .join(", ");
    }

    private getPhoneNumber(name: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "phone_number") throw new BaseError("Invalid notion data", 400);
        return property.phone_number || "";
    }

    private getStatus(name: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "status") throw new BaseError("Invalid notion data", 400);
        return property.status?.name || "";
    }

    private getUrl(name: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "url") throw new BaseError("Invalid notion data", 400);
        return property.url || "";
    }

    private getStartDate(name: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "date") throw new BaseError("Invalid notion data", 400);
        if (!property.date) throw new BaseError("Invalid notion data", 400);
        return property.date.start;
    }

    private getEndDate(name: string): string {
        const property = this.pageObj.properties[name];
        if (property.type !== "date") throw new BaseError("Invalid notion data", 400);
        if (!property.date) throw new BaseError("Invalid notion data", 400);
        const startDate = property.date.start;
        const endDate = property.date.end;
        if (!startDate && !endDate) throw new BaseError("Can't find the date", 400);
        else return endDate || startDate;
    }
}

export default FindNotionData;
