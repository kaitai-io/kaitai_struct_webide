import {defineStore} from "pinia";


export interface ValidationRule {
    regex: RegExp;
    errorMessage: string;
}
export interface TextInputModalStore {
    isOpen: boolean;
    title: string;
    rules?: ValidationRule[];
    inputValue: string;
    onAccept?(newValue: string): void;
    onClose?(): void;
}

export interface OpenTextInputProps {
    title: string;
    rules?: ValidationRule[];
    initValue?: string;
    onAccept?(newValue: string): void;
    onClose?(): void;
}

export const useTextModalInputStore = defineStore("TextInputModalStore", {
    state: (): TextInputModalStore => {
        return {
            isOpen: false,
            title: "",
            inputValue: ""
        };
    },
    actions: {
        open(props: OpenTextInputProps) {
            this.title = props.title;
            this.rules = props?.rules || [];
            this.inputValue = props?.initValue || "";
            this.onAccept = props?.onAccept || undefined;
            this.onClose = props?.onClose || undefined;
            this.isOpen = true;
        },
        close() {
            this.isOpen = false;
        },
    }
});
