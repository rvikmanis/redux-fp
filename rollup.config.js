import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import istanbul from 'rollup-plugin-istanbul';
import nodeResolve from 'rollup-plugin-node-resolve'
import commonJs from 'rollup-plugin-commonjs'

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

let plugins = [
  babel(babelrc()),
  process.env.TESTING
    ? istanbul({
        exclude: ['test/**/*', 'node_modules/**/*']
      })
    : null,
  nodeResolve({
    module: true,
    jsnext: true,
    main: true
  }),
  commonJs({})
]

plugins = plugins.filter(Boolean)

let configuration = {
  entry: 'src/index.js',
  plugins: plugins,
  external: external,
  targets: [
    {
      dest: pkg['main'],
      format: 'umd',
      moduleName: 'ReduxCurriedReducers',
      sourceMap: true
    },
    {
      dest: pkg['jsnext:main'],
      format: 'es',
      sourceMap: true
    }
  ]
};

if (process.env.TESTING) {
  configuration.targets = [{
    dest: 'tmp/with-coverage.js'
  }]
}

export default configuration
