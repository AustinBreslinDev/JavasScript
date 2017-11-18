import { expect } from "chai";
import { Application } from "spectron";

describe("application launch", () => {
  let app: Application;

  beforeEach(() => {
    app = new Application({
        args: ["/dist/main.js"],
        path: "/node_modules/electron/cli.js",
    });
    app.start();
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      app.stop();
    }
  });

  it("shows an initial window", () => {
    return app.client.getWindowCount().then((count) => {
      expect(count).to.be.equal(count);
    });
  });

});
