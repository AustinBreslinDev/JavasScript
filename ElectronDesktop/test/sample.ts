import "chai";
import "chai-as-promised";
import "mocha";
import { assert } from "sinon";

describe("Sample Suite", () => {

    before((callBack: MochaDone) => {
        setTimeout(() => {
            callBack();
        }, 200);
    });

    it("Sholud do something", () => {
        assert.pass(true);
    });
});
