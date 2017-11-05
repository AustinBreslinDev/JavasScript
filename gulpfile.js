const gulp = require ("gulp");
const tsc = require ("gulp-tsc");
const tslint = require ("gulp-tslint");
const uglifyjs = require ("gulp-uglify");
const pump = require ("pump");
const util = require ("gulp-util");
const htmlmin = require ("gulp-htmlmin");
const cleaner = require ("gulp-clean");
const { exec } = require('child_process');

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