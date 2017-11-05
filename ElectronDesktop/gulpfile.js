const gulp = require ("gulp");
const tsc = require ("gulp-tsc");
const tslint = require ("gulp-tslint");
const uglifyjs = require ("gulp-uglify");
const pump = require ("pump");
const util = require ("gulp-util");
const htmlmin = require ("gulp-htmlmin");
const cleaner = require ("gulp-clean");
const { exec } = require('child_process');
const istanbulReport = require("gulp-istanbul-report");
const mochaPhantom = require("gulp-mocha-phantomjs");


const electronCLI = `${__dirname}/node_modules/electron/cli.js`;
const testFolder = `${__dirname}/test/`;
const distFolder = `${__dirname}/dist/`;
const libFolder = `${__dirname}/lib/`;
const distStyleFolder = `${distFolder}/styles/`;
const distViewFolder = `${distFolder}/views/`;
const libStyleFolder = `${libFolder}/styles/`;
const libViewFolder = `${libFolder}/views/`;
const coverageFile = `${testFolder}coverage.json`;
const jsWildCard = "**/*.js`";
const tsWildCard = "**/*.ts";
const folderWildCard = "**";

function errorHandle (cb, error) {
    if (error) {
        util.log("Error "+ error);
        cb(error);
    } else {
        cb();
    }
}

gulp.task("clean", (cb) => {
    pump([
        gulp.src(`${distFolder}${folderWildCard}`),
        cleaner({read: false})
    ],(error) => {
        errorHandle(cb, error);
    });
});

gulp.task("typescript", ["clean"], (cb) => {
    pump([
        gulp.src(`${libFolder}${tsWildCard}`),
        tslint({
            formatter: "verbose",
            configuration: "tslint.json"
        }),
        tslint.report(),
        gulp.src(`${libFolder}${tsWildCard}`),
        tsc(),
        uglifyjs(),
        gulp.dest(`${distFolder}`)
    ],(error) => {
        errorHandle(cb, error);
    });
});

gulp.task("staticFiles", ["clean"], (cb) => {
    exec(`mkdir ${distViewFolder}`);
    exec(`mkdir ${distStyleFolder}`);
    pump([
        gulp.src(`${libViewFolder}${folderWildCard}`),
        htmlmin({
            caseSensitive: true,
            collapseWhitespace: true,
            html5: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            useShortDoctype: true
        }), 
        gulp.dest(`${distViewFolder}`),
        gulp.src(`${libStyleFolder}${folderWildCard}`),
        htmlmin(),
        gulp.dest(`${distStyleFolder}`)
    ],(error) => {
        errorHandle(cb, error);
    });
});

gulp.task("test",(cb) => {
    const mochaPhantomOpts = {
      phantomjs: {
        hooks: 'mocha-phantomjs-istanbul',
        coverageFile: coverageFile 
      },
    };

    pump([
        gulp.src(`${testFolder}${tsWildCard}`),
        tsc(),
        gulp.dest(`${testFolder}`),
        gulp.src(`${testFolder}${folderWildCard}`)
        .pipe(mochaPhantom(mochaPhantomOpts))
        .on("finish", () => {
            gulp.src(coverageFile)
            .pipe(istanbulReport());
        }),
        // gulp.src(`${testFolder}${jsWildCard}`),
        // cleaner({read:false})
    ],(error) => {
        errorHandle(cb, error);
    });
});

gulp.task('default',["clean", "typescript", "staticFiles"], (cb) => {
    exec(`${electronCLI} ${distFolder}main.js`,(error, stdout, stderr) => {
        util.log(stdout);
        util.log("");
        util.log(stderr);
        util.log("");
        util.log("Finished Build");
        errorHandle(cb, error);
    });
});