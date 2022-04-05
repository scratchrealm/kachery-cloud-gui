"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sleepMsec = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
exports.default = sleepMsec;
//# sourceMappingURL=sleepMsec.js.map