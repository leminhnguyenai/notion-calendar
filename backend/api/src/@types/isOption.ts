import { Option } from "./connections";

function isOption(obj: unknown): obj is Option {
    return (
        typeof obj == "object" &&
        obj !== null &&
        (obj as Option).name !== undefined &&
        (obj as Option).value !== undefined
    );
}

export default isOption;
