// eslint-disable-next-line @typescript-eslint/no-var-requires
const sonarqubeScanner = require('sonarqube-scanner');

sonarqubeScanner({
    serverUrl:  'http://localhost:9000',
    options : {
      'sonar.projectName': 'nestJS-easy-auth',
      'sonar.sources':  'src',
      'sonar.tests':  'src',
      'sonar.inclusions'  :  '**',
      'sonar.test.inclusions':  '**/*spec.ts',
      'sonar.exclusions': '**/node_modules/**',
      'sonar.javascript.lcov.reportPaths':  'coverage/lcov.info',
      'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.testExecutionReportPaths':  'coverage/test-reporter.xml'
    }
});
