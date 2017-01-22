var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", 'aurelia-framework', "aurelia-binding"], function (require, exports, aurelia_framework_1, aurelia_binding_1) {
    "use strict";
    class ItemStepper {
        constructor() {
            this.current = 0;
            this.total = 0;
        }
        itemsChanged() {
            this.current = 0;
            this.total = this.items.length;
        }
        currentChanged() {
            this.selected = this.items[this.current - 1];
        }
        move(direction) {
            var newCurr = this.current + direction;
            if (newCurr > this.total)
                newCurr = 1;
            if (newCurr < 1)
                newCurr = this.total;
            this.current = newCurr;
        }
    }
    __decorate([
        aurelia_framework_1.bindable
    ], ItemStepper.prototype, "current", void 0);
    __decorate([
        aurelia_framework_1.bindable
    ], ItemStepper.prototype, "items", void 0);
    __decorate([
        aurelia_framework_1.bindable({ defaultBindingMode: aurelia_binding_1.bindingMode.twoWay })
    ], ItemStepper.prototype, "selected", void 0);
    exports.ItemStepper = ItemStepper;
});
//# sourceMappingURL=item-stepper.js.map