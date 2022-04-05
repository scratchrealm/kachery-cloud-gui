"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGoogleServiceAccountCredentials = void 0;
const kacheryTypes_1 = require("../../src/commonInterface/kacheryTypes");
const isGoogleServiceAccountCredentials = (x) => {
    return (0, kacheryTypes_1._validateObject)(x, {
        type: (0, kacheryTypes_1.isEqualTo)('service_account'),
        project_id: kacheryTypes_1.isString,
        private_key_id: kacheryTypes_1.isString,
        private_key: kacheryTypes_1.isString,
        client_email: kacheryTypes_1.isString,
        client_id: kacheryTypes_1.isString,
    }, { allowAdditionalFields: true });
};
exports.isGoogleServiceAccountCredentials = isGoogleServiceAccountCredentials;
//# sourceMappingURL=GoogleServiceAccountCredentials.js.map