module.exports = function(grunt) {

  grunt.initConfig({
    eslint: {
      target: ['source/**/*.js']
    },
  });

  grunt.loadNpmTasks('grunt-eslint');

  // A very basic default task.
  grunt.registerTask('default', 'Log some stuff.', function() {
    grunt.log.write('Logging some stuff...').ok();
  });

  grunt.registerTask('lint', ['eslint']);

};
