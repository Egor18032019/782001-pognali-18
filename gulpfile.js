"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var del = require("del");
// используем в clean
var webp = require("gulp-webp");
// оптимизация изображений
var svgstore = require("gulp-svgstore");
// для свг
var imagemin = require("gulp-imagemin");
// для png
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
// для вставки в html
var rename = require("gulp-rename");
var csso = require("gulp-csso");
// минификатор для html
var htmlmin = require ("gulp-htmlmin");
//  минификатор JS
var uglify = require("gulp-uglify");

// css, jsmin и т.п. = это название задач. переменную обьявлять ненадо

gulp.task("css", function() {
  return gulp
    .src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("jsmin",function (){
  return gulp
  .src("sourse/js/*.js")
  .pipe(uglify())
  .pipe(rename({suffix:".min"}))
  .pipe(gulp.dest("build/js"))
});

  gulp.task("images", function() {
    return gulp
      .src("source/img/**/*{png,jpg,svg}")
      .pipe(
        imagemin([
          imagemin.optipng({ optimizationLevel: 3 }),
          imagemin.jpegtran({ progressive: true }),
          imagemin.svgo()
        ])
      )
      .pipe(gulp.dest("build/img"));
  });

  gulp.task("copy", function() {
    return gulp
      .src(
        [
          "source/fonts/**/*.{woff,woff2}",
          "source/js/**",
          "source/*.ico"
        ],
        {
          base: "source"
        }
      )
      .pipe(gulp.dest("build"));
  });

  gulp.task("clean", function() {
    return del("build");
  });

  gulp.task("sprite", function() {
    return gulp
      .src("source/img/icon-*.svg")
      .pipe(
        svgstore({
          inlineSvg: true
        })
      )
      .pipe(rename("sprite.svg"))
      .pipe(gulp.dest("build/img"));
  });

  gulp.task("html", function() {
    return gulp
      .src("source/*.html")
      .pipe(posthtml([include()]))
      .pipe(htmlmin())
      .pipe(gulp.dest("build"));
  });

  gulp.task("clean", function() {
    return del("build");
  });

  gulp.task("webp", function() {
    return gulp
      .src("source/img/**/*.{png,jpg}")
      .pipe(webp({ quality: 90 }))
      .pipe(gulp.dest("build/img"));
  });

  gulp.task("server", function () {
    server.init({
      server: "build/",
      notify: false,
      open: false,
      cors: true,
      port: 2000,
      ui: false
    });

    gulp.task("refresh", function(done) {
      server.reload();
      done();
    });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("css"));
  gulp.watch("source/img/icon-*.svg", gulp.series("sprite", "html", "refresh"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
});

gulp.task("build", gulp.series("clean","images", "webp","copy", "css", "sprite", "html","jsmin"));
gulp.task("start", gulp.series("build", "server"));
