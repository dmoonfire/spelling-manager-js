const expect = require("expect");
import * as path from "path";

describe(path.basename(__filename), function() {
    it("verify test framework works", function () {
        expect("test").toEqual("test");
    });
});
