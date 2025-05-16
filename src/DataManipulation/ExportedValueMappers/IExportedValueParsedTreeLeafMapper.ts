import {AbstractExportedValueMapper} from "./AbstractExportedValueMapper";
import {IExportedValue, ObjectType} from "../ExportedValueTypes";

export interface ParsedTreeLeaf {
    exportedValue: IExportedValue,
    depth: number;
    hasChildren: boolean;
    isClosed:boolean;
}

export class IExportedValueParsedTreeLeafMapper extends AbstractExportedValueMapper<void> {

    private leafs: ParsedTreeLeaf[] = [];
    private openPaths: string[] = [];
    private depth: number = 0;


    public collect(value: IExportedValue, openPaths: string[]): ParsedTreeLeaf[] {
        this.openPaths = openPaths;
        this.leafs = [];
        this.depth = 0;
        this.visitRoot(value);
        return this.leafs;
    }

    private visitRoot(value: IExportedValue) {
        switch (value.type) {
            case ObjectType.Object:
                Object.keys(value.object.fields || {})
                    .forEach(key => super.map(value.object.fields[key]));
                return;
            case ObjectType.Array:
                [...value.arrayItems]
                    .forEach(item => super.map(item));
                return;
            default:
                super.map(value);
        }
    }

    protected visitObject(value: IExportedValue): void {
        const leaf = this.mapToLeaf(value);
        this.leafs.push(leaf);
        if (leaf.isClosed) return;

        ++this.depth;
        Object.keys(value.object.fields || {})
            .forEach(key => super.map(value.object.fields[key]));
        --this.depth;
    }

    protected visitArray(value: IExportedValue): void {
        const leaf = this.mapToLeaf(value);
        this.leafs.push(leaf);
        if (leaf.isClosed) return;

        ++this.depth;
        [...value.arrayItems]
            .forEach(item => super.map(item));
        --this.depth;
    }


    protected visitPrimitive(value: IExportedValue): void {
        const leaf = this.mapToLeaf(value);
        this.leafs.push(leaf);
    }

    protected visitTypedArray(value: IExportedValue): void {
        const leaf = this.mapToLeaf(value);
        this.leafs.push(leaf);
    }

    protected visitEnum(value: IExportedValue): void {
        const leaf = this.mapToLeaf(value);
        this.leafs.push(leaf);
    }

    private mapToLeaf(value: IExportedValue) {
        const newLeaf: ParsedTreeLeaf = {
            exportedValue: value,
            depth: this.depth,
            hasChildren: this.checkIfHasChildren(value),
            isClosed: this.isTreeObjectClosed(value)
        };
        return newLeaf;
    }

    private checkIfHasChildren(value: IExportedValue) {
        switch (value.type) {
            case ObjectType.Object:
                return Object.keys(value.object.fields).length > 0;
            case ObjectType.Array:
                return value.arrayItems.length > 0;
            default:
                return false;
        }
    }


    private isTreeObjectClosed(value: IExportedValue) {
        switch (value.type) {
            case ObjectType.Object:
            case ObjectType.Array:
                const objectPath = value.path.join("/");
                return this.openPaths.indexOf(objectPath) === -1;
            default:
                return false;
        }

    }
}