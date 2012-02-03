
module.exports = exports = gyp

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , nopt = require('nopt')
  , child_process = require('child_process')
  , EE = require('events').EventEmitter
  , inherits = require('util').inherits
  , commands = [
        'configure'
      , 'build'
      , 'copy'
      , 'install'
    ]

/**
 * The `gyp` function.
 */

function gyp () {
  return new Gyp
}

function Gyp () {
  var me = this

  this.commands = {}
  commands.forEach(function (command) {
    me.commands[command] = function (argv, callback) {
      me.info('command:', command, argv)
      return require('./' + command)(me, argv, callback)
    }
  })
}
inherits(Gyp, EE)
exports.Gyp = Gyp
var proto = Gyp.prototype

/**
 * Export the contents of the package.json.
 */

proto.package = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'))

proto.configDefs = {
    debug: Boolean
  , verbose: Boolean
}

proto.shorthands = {}

proto.parseArgv = function parseOpts (argv) {
  this.opts = nopt(this.configDefs, this.shorthands, argv)
  this.argv = this.opts.argv.remain.slice()
  this.command = this.argv.shift()
}

/**
 * Spawns a child process and emits a 'spawn' event.
 */

proto.spawn = function spawn () {
  var cp = child_process.spawn.apply(child_process, arguments)
  this.emit('spawn', arguments[0], arguments[1], cp)
  return cp
}

/**
 * Logging mechanisms.
 */

proto.info = function info () {
  var args = Array.prototype.slice.call(arguments)
  args.unshift('info')
  this.emit.apply(this, args)
}

proto.verbose = function verbose () {
  var args = Array.prototype.slice.call(arguments)
  args.unshift('verbose')
  this.emit.apply(this, args)
}

proto.usageAndExit = function usageAndExit () {
  var usage = [
      ''
    , '  Usage: node-gyp <command> [options]'
    , commands.map(function (c) {
        return '    - ' + c + ' - ' + require('./' + c).usage
      }).join('\n')
    , ''
    , 'node-gyp@' + this.version + '  ' + path.resolve(__dirname, '..')
  ].join('\n')

  console.error(usage)
  process.exit(4)
}

/**
 * Version number proxy.
 */

Object.defineProperty(proto, 'version', {
    get: function () {
      return this.package.version
    }
  , enumerable: true
})
