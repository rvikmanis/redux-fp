import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import nodeResolve from 'rollup-plugin-node-resolve'
import commonJs from 'rollup-plugin-commonjs'

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

let plugins = [
  nodeResolve({
    module: true,
    jsnext: true,
    main: true
  }),
  commonJs({
    include: 'node_modules/**'
  }),
  babel(babelrc())
]

plugins = plugins.filter(Boolean)

let configuration = {
  entry: 'src/index.js',
  plugins: plugins,
  external: external,
  targets: [
    {
      dest: pkg['umd:main'],
      format: 'umd',
      moduleName: 'ReduxFp',
      sourceMap: true
    },
    {
      dest: pkg['jsnext:main'],
      format: 'es',
      sourceMap: true
    }
  ]
};

export default configuration
