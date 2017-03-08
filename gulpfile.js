var gulp = require("gulp");

var include = require('gulp-html-tag-include');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

gulp.task('html', function() {
  return gulp.src('./html/index.html')
    .pipe(include())
//    .pipe(preprocess({context: { VERSION: 'electron'}}))
    .pipe(gulp.dest("dist/"));
});

gulp.task('electron', function () {
});

gulp.task('ts', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});

gulp.task('js-tools', function() {
  return gulp.src('tools/*.js')
    .pipe(gulp.dest('dist/tools/'))
});

gulp.task('default', ['html', 'ts', 'js-tools']);
