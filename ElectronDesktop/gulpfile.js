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
        gulp.src("dist/**"),
        cleaner({
            read: false
        })
    ],(error) => {
        errorHandle(cb, error);
    });
});

gulp.task("typescript", ["clean"], (cb) => {
    pump([
        gulp.src("lib/*.ts"),
        tslint({
            formatter: "verbose",
            configuration: "tslint.json"
        }),
        tslint.report(),
        gulp.src("lib/**/*.ts"),
        tsc(),
        uglifyjs(),
        gulp.dest("dist/")
    ],(error) => {
        errorHandle(cb, error);
    });
});

gulp.task("staticFiles", ["clean"], (cb) => {
    exec(`mkdir ${__dirname}/dist/views`);
    exec(`mkdir ${__dirname}/dist/styles`);
    pump([
        gulp.src("lib/views/**"),
        htmlmin({
            caseSensitive: true,
            collapseWhitespace: true,
            html5: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            useShortDoctype: true
        }), 
        gulp.dest("dist/views"),
        gulp.src("lib/styles/**"),
        htmlmin(),
        gulp.dest("dist/styles")
    ],(error) => {
        errorHandle(cb, error);
    });
});

gulp.task("test",(cb) => {
    const coverageFile = `${__dirname}/coverage/coverage.json`;
    const mochaPhantomOpts = {
      phantomjs: {
        hooks: 'mocha-phantomjs-istanbul',
        coverageFile: coverageFile 
      },
    };

    exec(`tsc ${__dirname}/test/*.ts --allowJS --jsx preserve`, (error) => {
        if (error) {
            errorHandle(error, cb);
        } else {
            pump([
                gulp.src(`${__dirname}/test/**/*.js`,{read:false}),
                mochaPhantom(mochaPhantomOpts),
                gulp.src(coverageFile),
                istanbulReport()
            ],(error) => {
                if (error) {
                    errorHandle(cb, error);
                } else {
                    exec(`rm ${__dirname}/test/*.js`,(error) => {
                        errorHandle(cb, error);
                    });
                }
            });
        }
    });
});

gulp.task('default',["clean", "typescript", "staticFiles"], (cb) => {
    exec(`${__dirname}/node_modules/electron/cli.js ${__dirname}/dist/main.js`,(error, stdout, stderr) => {
        util.log(stdout);
        util.log("");
        util.log(stderr);
        util.log("");
        util.log("Finished Build");
        errorHandle(cb, error);
    });
});