import {AbstractExportedValueMapper} from "./AbstractExportedValueMapper";
import {IExportedValue} from "../../../entities";

export class FlattenToLeafsExportedValueMapper extends AbstractExportedValueMapper<void> {

    private tempObjects: IExportedValue[] = [];

    public map(value: IExportedValue): IExportedValue[] {
        this.tempObjects = [];
        super.map(value);
        return [...this.tempObjects];
    }

    protected visitObject(value: IExportedValue): void {
        Object.keys(value.object.fields || {}).forEach(key => {
            super.map(value.object.fields[key]);
        });
    }

    protected visitArray(value: IExportedValue): void {
        ([...value.arrayItems] || []).forEach((item) => super.map(item));
    }


    protected visitPrimitive(value: IExportedValue): void {
        this.tempObjects.push(value);
    }

    protected visitTypedArray(value: IExportedValue): void {
        this.tempObjects.push(value);
    }

    protected visitEnum(value: IExportedValue): void {
        this.tempObjects.push(value);
    }

}