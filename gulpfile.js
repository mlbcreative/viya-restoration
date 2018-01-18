var gulp    = require('gulp'),
browserSync = require('browser-sync').create(),
sass        = require('gulp-sass'),
postcss      = require('gulp-postcss'),
sourcemaps   = require('gulp-sourcemaps'),
autoprefixer = require('autoprefixer'),
htmlPartial = require('gulp-html-partial'),
concat = require('gulp-concat'),
uglify = require('gulp-uglify');

//html
gulp.task('html', function() {
	return gulp.src(['src/*.html'])
        .pipe(htmlPartial({
            basePath: 'src/partials/'
        }))
        .pipe(gulp.dest('build'))
})

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    var config = {
        sass: {
            outputStyle: 'compressed',
            includePaths : ['./node_modules/bootstrap/scss/', './node_modules/jquery.zooms/dist/']
        },
        autoprefixer: {
            browsers: ['last 5 versions']
        }
    };
	
	
	return gulp.src('src/scss/*.scss')
	.pipe(sass(config.sass))
	.pipe(sourcemaps.init())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('build/css'))
	.pipe(browserSync.stream());
});

gulp.task('js', ['js-vendor'], function() {
	return gulp.src('src/js/*.js')
	.pipe(gulp.dest('build/js/'));
})

gulp.task('js-vendor', function(){
	return gulp.src(['./node_modules/jquery/dist/jquery.min.js',
                     './node_modules/popper.js/dist/umd/popper.js',
                     './node_modules/bootstrap/dist/js/bootstrap.js',
                     './src/js/vendor/aws-cognito-sdk.min.js',
                     './src/js/vendor/amazon-cognito-identity.min.js',
                     './node_modules/js-autocomplete/auto-complete.js',
                     'src/js/vendor/*.js'])
    .pipe(concat('vendors.js'))
    .pipe(uglify()) 
	.pipe(gulp.dest('build/js/vendor'));
})

gulp.task('js-watch', ['js'], function(done) {
	browserSync.reload();
	done();
})

gulp.task('copy', function() {
	gulp.src('src/img/**')
	.pipe(gulp.dest('build/img'));

	gulp.src('src/css/**')
	.pipe(gulp.dest('build/css'));
})

// Static Server + watching scss/html files
gulp.task('serve', ['copy','sass', 'js', 'html'], function() {

    browserSync.init({
        server: "./build"
    });

    gulp.watch("src/scss/**", ['sass']);
    gulp.watch("src/js/*.js", ['js-watch']);
    //gulp.watch(, ['html]']);
    gulp.watch(["src/*.html", "src/partials/*.html"], ['html']).on('change', browserSync.reload);
});

gulp.task('default', ['serve']);