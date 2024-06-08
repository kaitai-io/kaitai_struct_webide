import {AbstractExportedValueMapper} from "./AbstractExportedValueMapper";

export class FlattenExportedValueMapper extends AbstractExportedValueMapper<IExportedValue[]> {

    private tempObjects: IExportedValue[] = [];

    public map(value: IExportedValue) {
        this.tempObjects = [];
        this._map(value);
        return [...this.tempObjects];
    }

    private _map(value: IExportedValue) {
        this.tempObjects.push(value);
        super.map(value);
    }

    protected visitObject(value: IExportedValue): IExportedValue[] {
        Object.keys(value.object.fields || {}).forEach(key => {
            this._map(value.object.fields[key]);
        });
        return null;
    }

    protected visitArray(value: IExportedValue): IExportedValue[] {
        ([...value.arrayItems] || []).forEach((item) => this._map(item));
        return null;
    }

}