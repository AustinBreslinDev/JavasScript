import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as url from "url";

/**
 * Not exporting the class because I don't want this to be used
 * anywhere else, this class is the main class like a
 * public static void main method within java or c# or c++.
 * @class
 */
class Main {
    /**
     * Publicly accesable method, that will return the
     * instance of the main window.
     * @returns {Main}
     */
    public static getInstance(): Main {
        if (Main.singleInstance === null) {
            Main.singleInstance = new Main();
        }

        return Main.singleInstance;
    }

    // Singleton pattern.
    private static singleInstance: Main | null = null;

    /**
     * Close method that takes a reference to the browser window
     * and makes it null, this is really just a workaround
     * for macs.
     * @param browserWindow
     * @returns {void}
     */
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

    /**
     * EventListener for every window close, mainWindow
     * and all subsequent childWindows.
     * @returns {void}
     */
    private onWindowAllClosed(): void {
        if (process.platform !== "darwin") {
            app.quit();
        }
    }

    /**
     * EventListener that Electrons emits, when it is completed activation.
     * Allows our windows to be instantiated.
     * @returns {void}
     */
    private onActivate(): void {
        if (this.mainWindow === null) {
            this.onReady();
        }
    }

    /**
     * This method is where most of the electron quick guide
     * code is actually written. It loads the index.html page,
     * sets the size o the window, and adds a close event listener
     * to our mainWindow in this case, but in other cases this code
     * code be reused in a different way for childWindows.
     * @returns {void}
     */
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
// The above code does nothing but declare a class, this below instatiates it.
Main.getInstance();
