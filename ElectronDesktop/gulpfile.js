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
    pump([
        buildScripts.deleteFolderRecurive(distFolder),
        buildScripts.makeFolder(distFolder)
    ],(error) => {
        buildScripts.errorHandle(cb, error);
    });
});

gulp.task("build-copy", (cb) => {
    let minify = true;
    pump([
        buildScripts.copyHTMLFiles(libFolder, distFolder, minify),
        gulp.dest(distFolder),
        buildScripts.copyCSSFiles(libFolder, distFolder, minify),
        gulp.dest(distFolder),
    ],(error) => {
        buildScripts.errorHandle(cb, error);
    });
});

gulp.task("build", ["build-copy"], (cb) => {
    let minify = true;
    pump([
        buildScripts.copyTSFiles(libFolder, distFolder, minify),
        gulp.dest(distFolder),
        buildScripts.copyTSXFiles(libFolder, distFolder, minify),
        gulp.dest(distFolder),
    ],(error) => {
        buildScripts.errorHandle(cb, error);
    });
});

gulp.task("test-copy", (cb) => {
    let minify= false;
    pump([
        buildScripts.copyHTMLFiles(libFolder, tempFolder, minify),
        gulp.dest(tempFolder),
        buildScripts.copyCSSFiles(libFolder, tempFolder, minify),
        gulp.dest(tempFolder),
    ], (error) => {
        buildScripts.errorHandle(cb,error);
    });
});

gulp.task("test", ["test-copy"], (cb) => {
    let minify = false;
    pump([
        buildScripts.makeFolder(tempFolder),
        buildScripts.copyTSFiles(libFolder, tempFolder, minify),
        // gulp.dest(tempFolder),
        buildScripts.copyTSXFiles(libFolder, tempFolder, minify),
    ],(error) => {
        buildScripts.errorHandle(cb, error);
    });
    
    // gulp.src(`${tempFolder}${jsWildCard}`, {read:false}),
    // mocha(),
    // istanbul.writeReports({
    //     dir: './coverage',
    //     reporters: [ 'json', 'text', 'text-summary', 'html' ],
    //     reportOpts: {
    //         json: {dir: 'json', file: './coverage/converage.json'},
    //         html: {
    //             dir: './coverage/html',
    //             file: 'coverage.html',
    //             watermarks: {
    //                 statements: [ 50, 85 ],
    //                 lines: [ 50, 85 ],
    //                 functions: [ 50, 85 ],
    //                 branches: [ 50, 85 ]
    //             }
    //         }
    //     }
    // }),
    // istanbul.enforceThresholds({thresholds: 90})
    // });
});