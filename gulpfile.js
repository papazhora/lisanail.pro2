var syntax        = 'sass'; // Syntax: sass or scss;

var gulp              = require('gulp'),
		gutil         = require('gulp-util' ),
		sass          = require('gulp-sass'),
		browsersync   = require('browser-sync'),
		concat        = require('gulp-concat'),
		uglify        = require('gulp-uglify'),
		cleancss      = require('gulp-clean-css'),
		rename        = require('gulp-rename'),
		autoprefixer  = require('gulp-autoprefixer'),
		notify        = require("gulp-notify"),
		rsync         = require('gulp-rsync')
		imagemin     = require('gulp-imagemin')
		pngquant     = require('imagemin-pngquant');

gulp.task('browser-sync', function() {
	browsersync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// open: false,
		// tunnel: true,
		// tunnel: "projectname", //Demonstration page: http://projectname.localtunnel.me
	})
});

gulp.task('clear', function() {  //Очистка кэша картинок в ручном режиме
    cache.clearAll();
});

gulp.task('img', function() {
    return(gulp.src('app/img/**/*'))
    .pipe(cache(imagemin({
        interlaced: true,
        progressive: true,
        optimizationLevel: 5,
        svgoPlugins: [{removeViewBox: true}],
        une: [pngquant()]
    })))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('styles', function() {
	return gulp.src('app/'+syntax+'/**/*.'+syntax+'')
	.pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest('app/css'))
	.pipe(browsersync.reload( {stream: true} ))
});

gulp.task('js', function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/js/common.js', // Always at the end
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('app/js'))
	.pipe(browsersync.reload({ stream: true }))
});

gulp.task('rsync', function() {
	return gulp.src('app/**')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});

gulp.task('watch', ['styles', 'js', 'browser-sync'], function() {
	gulp.watch('app/'+syntax+'/**/*.'+syntax+'', ['styles']);
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
	gulp.watch('app/*.html', browsersync.reload)
});

gulp.task('default', ['watch']);

gulp.task('clean', function() {
    return del.sync('dist');
});

gulp.task('build', ['clean', 'img', 'styles', 'js'], function() {
    var buildCss = gulp.src([
        'app/css/main.css',
        'app/css/libs.min.css',

    ])
    .pipe(gulp.dest('dist/css'));

    var buildFonts = gulp.src('app/fonts/**/*')

    .pipe(gulp.dest('dist/fonts'));

    var buildJs = gulp.src('app/js/**/*')
    .pipe(gulp.dest('dist/js'));

    var buildHtml = gulp.src('app/*.html')
    .pipe(gulp.dest('dist'));
});
