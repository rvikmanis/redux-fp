const instanbul = require('istanbul');
const MochaSpecReporter = require('mocha/lib/reporters/spec');

module.exports = function (runner) {
  const collector = new instanbul.Collector();
  const reporter = new instanbul.Reporter();
  new MochaSpecReporter(runner);

  runner.on('end', function () {
    collector.add(global.__coverage__);
    reporter.addAll(['json', 'lcovonly']);
    reporter.write(collector, true, function () {
      process.stdout.write('report generated');
    });
  });
};
