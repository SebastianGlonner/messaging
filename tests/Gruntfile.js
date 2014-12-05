module.exports = function(grunt) {
  grunt.initConfig({
    jasmine_node: {
      dev: ['specsNodeDev/'],
      all: ['specsNode/']
    },
    watch: {
      options: {
        livereload: true
      },
      tasks: ['jasmine_node:dev'],
      files: [
        'Gruntfile.js',
        'SpecRunner.html',
        '../bin/*.js',
        'specsNodeDev/*.js',
        'data/**/*.*'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['watch']);

};
