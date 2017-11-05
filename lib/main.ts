import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as url from "url";

class Main {
    public static getInstance(): Main {
        if (Main.singleInstance === null) {
            Main.singleInstance = new Main();
        }

        return Main.singleInstance;
    }

    private static singleInstance: Main | null = null;

    private static onClose(browserWindow: BrowserWindow | null): void {
        // Work around, as this.onClose was not working and always
        // saying this was not a function. Tried a few other workarounds,
        // this was the least hassel, .bind didn't work also.
        browserWindow = null;
    }

    private mainWindow: Electron.BrowserWindow;

    private constructor() {
        app.on("window-all-closed", this.onWindowAllClosed);
        app.on("ready", this.onReady);
        app.on("activate", this.onActivate);
    }

    private onWindowAllClosed(): void {
        if (process.platform !== "darwin") {
            try {
                app.quit();
            } catch (error) {
                // tslint:disable-next-line:no-console
                console.error(error);
            }
        }
    }

    private onActivate(): void {
        if (this.mainWindow === null) {
            this.onReady();
        }
    }

    private onReady(): void {
        const pathName: string = path.join(__dirname, "/views/index.html");

        this.mainWindow = new BrowserWindow({ width: 800, height: 600 });
        this.mainWindow.loadURL(url.format({
            pathname: pathName,
            protocol: "file:",
            slashes: true
        } as url.UrlObject));

        this.mainWindow.maximize();

        this.mainWindow.on("closed", () => {
            Main.onClose(this.mainWindow);
        });
    }
}
Main.getInstance();
