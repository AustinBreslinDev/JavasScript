const gulp = require ("gulp");
const tsc = require ("gulp-tsc");
const tslint = require ("gulp-tslint");
const uglifyjs = require ("gulp-uglify");
const util = require ("gulp-util");
const htmlmin = require ("gulp-htmlmin");
const del = require ("del");
const fs = require ("fs");
const glob = require ("glob").sync;

const jsWildCard = "**/*.js`";
const tsWildCard = "**/*.ts";
const folderWildCard = "**";

module.exports =  (() => {
    let verifyTrailingSlash = (folderToCheck) => {
        if (folderToCheck.lastIndexOf('/') !== folderToCheck.length - 1) {
            folderToCheck += "/";
        }
        return folderToCheck;
    }

    let doesGlobPatternMatchesFiles = (globPattern) => {
        let foundFiles = glob(globPattern);
        util.log(`globPattern ${globPattern} found ${foundFiles.length} number of files`);
        return foundFiles.length > 0;
    }
    
    function buildScripts () {}

    buildScripts.prototype.errorHandle = (cb, error) => {
        if (error) {
            util.log("Error "+ error);
            cb(error);
        } else {
            util.log("Finished with no error");
            cb();
        }
    }
    
    
    buildScripts.prototype.copyTSFiles = (sourceFolder, destination, minify) => {
        sourceFolder = verifyTrailingSlash(sourceFolder);
        destination = verifyTrailingSlash(destination);
    
        let tscOptions = {
            // outDir : destination,
            // sourceMap: true
        };
    
        let minifyOptions = {};
        
        let tslintOptions = {
            formatter: "verbose",
            configuration: "tslint.json"
        };
        
        if (doesGlobPatternMatchesFiles(`${sourceFolder}${tsWildCard}`)) {
            return (
                gulp.src(`${sourceFolder}${tsWildCard}`)
                .pipe(util.log(`TSLint on ${sourceFolder}`) == 1 ? util.noop() : util.noop())
                .pipe(tslint(tslintOptions))
                .pipe(tslint.report())
                .pipe(util.log(`Compliing on ${sourceFolder}`) == 1 ? util.noop() : util.noop())
                .pipe(tsc(tscOptions))
                .pipe(minify ? uglifyjs(minifyOptions) : util.noop())
                .pipe(util.log(`Moving compiled to ${destination}`) == 1 ? util.noop() : util.noop())
                .pipe(gulp.dest(destination))
            );
        } else {
            util.log(`No TS files in ${sourceFolder} were found for compiling.`);
            return util.noop({});
        }
    }
    
    buildScripts.prototype.copyHTMLFiles = (sourceFolder, destination, minify) =>{
        let htmlMinOptions = {
            caseSensitive: true,
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            html5: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            useShortDoctype: true
        };
        
        sourceFolder = verifyTrailingSlash(sourceFolder)
        destination = verifyTrailingSlash(destination);
        
        if (doesGlobPatternMatchesFiles(`${sourceFolder}${folderWildCard}/*.html`)) {
            return (
                gulp.src(`${sourceFolder}${folderWildCard}/*.html`)
                .pipe(util.log(`Moving static html from ${sourceFolder}`) == 1 ? util.noop() : util.noop())
                .pipe(minify ? htmlmin(htmlMinOptions) : util.noop())
                .pipe(util.log(`Moving static html to ${destination}`) == 1 ? util.noop() : util.noop())
                .pipe(gulp.dest(destination))
            );
        } else {
            util.log(`No HTML Files in folde ${sourceFolder} were found for copying.`);
            return (
                util.noop({})
            );
        }
    }
    
    buildScripts.prototype.copyCSSFiles = (sourceFolder, destination, minify) => {
        let minifyOptions = {};
        sourceFolder = verifyTrailingSlash(sourceFolder);
        destination = verifyTrailingSlash(destination);
        
        if (doesGlobPatternMatchesFiles(`${sourceFolder}${folderWildCard}/*.css`)) {
            return (
                gulp.src(`${sourceFolder}${folderWildCard}/*.css`)
                .pipe(util.log(`Moving static css from ${sourceFolder}`) == 1 ? util.noop() : util.noop())
                .pipe(minify ? util.noop() : util.noop()) // in here until minify added
                .pipe(util.log(`Moving static css to ${destination}`) == 1 ? util.noop() : util.noop())
                .pipe(gulp.dest(destination))
            );
        } else {
            util.log(`No CSS files in folder ${sourceFolder} were found for copying.`);
            return (
                util.noop({})
            );
        }
    }
    
    buildScripts.prototype.copyTSXFiles = (sourceFolder, destination, minify) => {
        let minifyOptions = {};
        let tscOptions = {};
        
        let tslintOptions = {
            formatter: "verbose",
            configuration: "tslint.json"
        };
        
        sourceFolder = verifyTrailingSlash(sourceFolder);
        destination = verifyTrailingSlash(destination);
        
        if (doesGlobPatternMatchesFiles(`${sourceFolder}${folderWildCard}/*.tsx`)) {
            return (
                gulp.src(`${sourceFolder}${folderWildCard}/*.tsx`)
                .pipe(util.log(`Searching for TSX Files in ${sourceFolder}`) == 1 ? util.noop() : util.noop())
                .pipe(tslint(tslintOptions))
                .pipe(util.log(`Running TS Lint on TSX Files in ${sourceFolder}`) == 1 ? util.noop() : util.noop())
                .pipe(tslint.report())
                .pipe(util.log(`Compiling TSX Files in ${sourceFolder}`) == 1 ? util.noop() : util.noop())
                .pipe(tsc(tscOptions))
                .pipe(minify ? uglifyjs(minifyOptions) : util.noop())
                .pipe(util.log(`Moving Compiled TSX Files to ${destination}`) == 1 ? util.noop() : util.noop())
                .pipe(gulp.dest(destination))
            );
        } else {
            util.log(`No tsx files were found to compile.`);
            return (
                util.noop({})
            );
        }
    }
    
    buildScripts.prototype.makeFolder = (folderToMake) => {
        folderToMake = verifyTrailingSlash(folderToMake);
        let doesExist = fs.existsSync(folderToMake);
        if (!doesExist) {
            fs.mkdirSync(folderToMake);
        } else {
            util.log(`Folder by name ${folderToMake} already exists`);
        }
        return util.noop({});
    }
    
    buildScripts.prototype.deleteFolderRecurive = (folderToDelete) => {
        folderToDelete = verifyTrailingSlash(folderToDelete) + folderWildCard;
        if (folderToDelete.indexOf(__dirname) !== -1) {
            util.log(`Deleting ${folderToDelete}`);
            del([folderToDelete])
            .then( (result) => {
                util.log(`Finished deltion result = ${result}`);
            })
            .catch( (error) => {
                util.log(`Finished deltion with error = ${error}`);
            });
        } else {
            util.log(`No folder by name ${folderToDelete} exists for deletion.`);
        }
        return util.noop({});
    }

    return new buildScripts();
})();
