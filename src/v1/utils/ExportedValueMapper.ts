export const mapToGenericObject = (exportedValue: IExportedValue): any => {
    const mapAny = (value: IExportedValue): any => {
        switch (value.type) {
            case ObjectType.Primitive:
                return mapPrimitive(value);
            case ObjectType.Array:
                return mapArray(value);
            case ObjectType.TypedArray:
                return mapTypedArray(value);
            case ObjectType.Object:
                return mapObject(value);
            case ObjectType.Undefined:
                return undefined;
        }
    }

    const mapPrimitive = (value: IExportedValue): any => {
        const isEnumValue = !!value.enumStringValue;
        return isEnumValue
            ? mapEnum(value)
            : value.primitiveValue
    }

    const mapArray = (value: IExportedValue): any[] => {
        return value.arrayItems.map(mapAny);
    }

    const mapTypedArray = (value: IExportedValue) => {
        return value.bytes.length <= 64
            ? [...value.bytes]
            : {
                $start: value.ioOffset + value.start,
                $end: value.ioOffset + value.end - 1
            };
    }

    const mapObject = (value: IExportedValue): object => {
        const newObject = {};
        Object.keys(value.object.fields).forEach(key => {
            newObject[key] = mapAny(value.object.fields[key])
        })
        return newObject;
    }
    
    const mapEnum = (value: IExportedValue): object => {
        return {
            name: value.enumStringValue,
            value: value.primitiveValue
        }
    }
    
    return mapAny(exportedValue)
}