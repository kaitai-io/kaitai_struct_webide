import { bindable } from 'aurelia-framework';
import { bindingMode } from "aurelia-binding";

export class ItemStepper {
    @bindable private current: number = 0;
    private total: number = 0;

    @bindable items: any[];
    @bindable({ defaultBindingMode: bindingMode.twoWay }) selected: any;

    itemsChanged() {
        this.current = 0;
        this.total = this.items.length;
    }

    currentChanged() {
        this.selected = this.items[this.current - 1];
    }

    move(direction: number) {
        var newCurr = this.current + direction;

        if (newCurr > this.total)
            newCurr = 1;

        if (newCurr < 1)
            newCurr = this.total;

        this.current = newCurr;
    }
}