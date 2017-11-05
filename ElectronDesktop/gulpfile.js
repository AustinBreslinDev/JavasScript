const gulp = require ("gulp");
const tsc = require ("gulp-tsc");
const tslint = require ("gulp-tslint");
const uglifyjs = require ("gulp-uglify");
const pump = require ("pump");
const util = require ("gulp-util");
const htmlmin = require ("gulp-htmlmin");
const cleaner = require ("gulp-clean");
const { exec } = require('child_process');
// const mocha = require("gulp-mocha");
const istanbulReport = require("gulp-istanbul-report");
const mochaPhantom = require("gulp-mocha-phantomjs");


gulp.task("tslint", (cb) => {
    pump([
        gulp.src("lib/*.ts"),
        tslint({
            formatter: "verbose",
            configuration: "tslint.json"
        }),
        tslint.report(),
    ],(error) => {
        if (error) {
            util.log("Error "+ error);
            cb(error);
        } else {
            util.log("Finished TSLint, no errors.");
            cb();
        }
    });
});

gulp.task("clean", (cb) => {
    pump([
        gulp.src("dist/**/*.*"),
        cleaner({
            read: false
        })
    ],(error) => {
        if (error) {
            util.log("Error "+ error);
            cb(error);
        } else {
            util.log("Finished deleting old files.");
            cb();
        }
    });
});

gulp.task("tsc",["tslint", "clean"], (cb) => {
    pump([
        gulp.src("lib/**/*.ts"),
        tsc(),
        uglifyjs(),
        gulp.dest("dist/")
    ],(error) => {
        if (error) {
            util.log("Error "+ error);
            cb(error);
        } else {
            util.log("Finished TypeScript compiling.");
            cb();
        }
    });
});

gulp.task("staticFiles", ["tsc"], (cb) => {
    exec(`mkdir ${__dirname}/dist/views`);
    exec(`mkdir ${__dirname}/dist/styles`);
    pump([
        gulp.src("lib/views/**"), 
        gulp.dest("dist/views"),
        gulp.src("lib/styles/**"),
        gulp.dest("dist/styles")
    ],(error) => {
        if (error) {
            util.log("Error "+ error);
            cb(error);
        } else {
            util.log("Finished Copying Static Files.");
            cb();
        }
    });
});

gulp.task("minifyStatic", ["staticFiles"], (cb) => {
    pump([
        gulp.src("dist/views/**/*.html")
        .pipe(htmlmin({
            caseSensitive: true,
            collapseWhitespace: true,
            html5: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            useShortDoctype: true
        }))
        .pipe(gulp.dest("dist/views/")),
        gulp.src("dist/views/**/*.css")
        .pipe(
            htmlmin()
        )
        .pipe(gulp.dest("dist/views/"))
    ],(error) => {
        if (error) {
            util.log("Error "+ error);
            cb(error);
        } else {
            util.log("Finished Minifying Static Files.");
            cb();
        }
    });
});

gulp.task("test",(cb) => {
    function errorHandle (error) {
        if (error) {
            util.log("Error "+ error);
            cb(error);
        } else {
            util.log("Finished Minifying Static Files.");
            cb();
        }
    }

    const coverageFile = `${__dirname}/coverage/coverage.json`;
    const mochaPhantomOpts = {
      phantomjs: {
        hooks: 'mocha-phantomjs-istanbul',
        coverageFile: coverageFile 
      },
    };

    exec(`tsc ${__dirname}/test/*.ts --allowJS --jsx preserve`, (error) => {
        if (error) {
            errorHandle(error);
        } else {
            pump([
                gulp.src(`${__dirname}/test/**/*.js`,{read:false}),
                mochaPhantom(mochaPhantomOpts),
                gulp.src(coverageFile),
                istanbulReport(),
                
            ],(error) => {
                if (error) {
                    errorHandle(error);
                } else {
                    exec(`rm ${__dirname}/test/*.js`,errorHandle);
                }
            });
        }
    });
});

gulp.task('default',["tslint", "tsc", "staticFiles", "minifyStatic"], (cb) => {
    util.log("Finished Build");
    exec(`${__dirname}/node_modules/electron/cli.js ${__dirname}/dist/main.js`,(error, stdout, stderr) => {
        if (error) {
            util.log("Error "+ error);
            cb(error);
        } else {
            util.log("Finished Loading application.");
            cb();
        }
    });
});