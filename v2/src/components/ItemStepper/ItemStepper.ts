import { bindable } from "aurelia-framework";
import { bindingMode } from "aurelia-binding";

export class ItemStepper {
    @bindable private current: number = 0;
    @bindable private currentStr = "-";
    private total: number = 0;

    @bindable items: any[];
    @bindable({ defaultBindingMode: bindingMode.twoWay }) selected: any;

    itemsChanged() {
        this.current = 0;
        this.total = this.items.length;
    }

    currentChanged() {
        if (this.current === 0)
            this.currentStr = "-";
        else {
            this.selected = this.items[this.current - 1];
            this.currentStr = this.current.toString();
        }            
    }

    move(direction: number) {
        var newCurr = this.current + direction;
        this.current = newCurr > this.total ? 1 : newCurr < 1 ? this.total : newCurr;
    }
}