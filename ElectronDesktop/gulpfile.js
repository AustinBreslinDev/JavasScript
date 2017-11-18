const gulp = require ("gulp");
const pump = require ("pump");
const { exec } = require ('child_process');
const istanbul = require ("gulp-istanbul");
const mocha = require ("gulp-mocha");
const buildScripts = require ("./buildScripts/buildScripts");

const electronCLI = `${__dirname}/node_modules/electron/cli.js`;
const testFolder = `${__dirname}/test/`;
const distFolder = `${__dirname}/dist/`;
const libFolder = `${__dirname}/lib/`;
const tempFolder = `${__dirname}/tempFolder/`;

gulp.task("clean", (cb) => {
    pump([
        buildScripts.deleteFolderRecurive(distFolder),
        buildScripts.deleteFolderRecurive(tempFolder),
    ],(error) => {
        buildScripts.errorHandle(cb, error);
    });
});

gulp.task("build-pre-copy", (cb) => {
    cb();
    // pump([
    //     // buildScripts.deleteFolderRecurive(distFolder),
    // ],(error) => {
    //     buildScripts.errorHandle(cb, error);
    // });
});

gulp.task("build-copy", ["clean"], (cb) => {
    let minify = true;
    pump([
        buildScripts.makeFolder(distFolder),
        buildScripts.copyHTMLFiles(libFolder, distFolder, minify),
        buildScripts.copyCSSFiles(libFolder, distFolder, minify),
    ],(error) => {
        buildScripts.errorHandle(cb, error);
    });
});

gulp.task("build", ["build-copy"], (cb) => {
    let minify = true;
    pump([
        buildScripts.copyTSFiles(libFolder, distFolder, minify),
        buildScripts.copyTSXFiles(libFolder, distFolder, minify),
    ],(error) => {
        buildScripts.errorHandle(cb, error);
    });
});

gulp.task("test-copy", ["build"], (cb) => {
    let minify= false;
    pump([
        buildScripts.makeFolder(tempFolder),
        buildScripts.copyHTMLFiles(testFolder, tempFolder, minify),
        buildScripts.copyCSSFiles(testFolder, tempFolder, minify),
    ], (error) => {
        buildScripts.errorHandle(cb,error);
    });
});

gulp.task("test", ["test-copy"], (cb) => {
    let minify = false;
    pump([
        buildScripts.copyTSFiles(testFolder, tempFolder, minify),
        buildScripts.copyTSXFiles(testFolder, tempFolder, minify),
        buildScripts.test(tempFolder)
    ],(error) => {
        buildScripts.errorHandle(cb, error);
    });
});