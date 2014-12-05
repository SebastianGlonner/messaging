/**
 * Gruntfile.
 * @param {object} grunt Grunt reference.
 */
module.exports = function(grunt) {

  grunt.initConfig({
    express: {
      dev: {
        options: {
          script: 'server.js'
        }
      }
    },
    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'public/css/index.css' : 'public/css/index.scss'
        }
      }
    },
    watch: {
      scss: {
        files: [
          'public/css/index.scss'
        ],
        tasks: ['sass']
      },
      livereload: {
        options: {
          livereload: true
        },
        files: [
          'public/css/index.css',
          'public/*.js',
          'server.js'
        ]
      },
      express: {
        files: [
          'server.js'
        ],
        tasks: ['express:dev'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('server', ['express:dev', 'watch']);

};
