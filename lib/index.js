'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _Parser = require('./Parser');

var _Parser2 = _interopRequireDefault(_Parser);

var _scopeGenerator = require('./scopeGenerator');

var _scopeGenerator2 = _interopRequireDefault(_scopeGenerator);

var _postcssModulesLocalByDefault = require('postcss-modules-local-by-default');

var _postcssModulesLocalByDefault2 = _interopRequireDefault(_postcssModulesLocalByDefault);

var _postcssModulesScope = require('postcss-modules-scope');

var _postcssModulesScope2 = _interopRequireDefault(_postcssModulesScope);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _lodash = require('lodash.camelcase');

var _lodash2 = _interopRequireDefault(_lodash);

var _genericNames = require('generic-names');

var _genericNames2 = _interopRequireDefault(_genericNames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getScopedNameGenerator(opts) {
  var scopedNameGenerator = opts.generateScopedName || _scopeGenerator2.default;

  if (typeof scopedNameGenerator === 'function') return scopedNameGenerator;
  return (0, _genericNames2.default)(scopedNameGenerator, { context: process.cwd() });
}

function dashesCamelCase(string) {
  return string.replace(/-+(\w)/g, function (_, firstLetter) {
    return firstLetter.toUpperCase();
  });
}

exports.default = _postcss2.default.plugin('postcss-css-modules', function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var plugins = [_postcssModulesLocalByDefault2.default, _postcssModulesScope2.default];
  var parser = new _Parser2.default();

  _postcssModulesScope2.default.generateScopedName = getScopedNameGenerator(opts);

  return function (css, result) {
    var styles = (0, _postcss2.default)(plugins.concat(parser.plugin)).process(css).css;

    if (opts.localsConvention) {
      var isFunc = typeof opts.localsConvention === "function";

      parser.exportTokens = Object.entries(parser.exportTokens).reduce(function (tokens, _ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            className = _ref2[0],
            value = _ref2[1];

        if (isFunc) {
          tokens[opts.localsConvention(className, value, inputFile)] = value;

          return tokens;
        }

        switch (opts.localsConvention) {
          case "camelCase":
            tokens[className] = value;
            tokens[(0, _lodash2.default)(className)] = value;

            break;
          case "camelCaseOnly":
            tokens[(0, _lodash2.default)(className)] = value;

            break;
          case "dashes":
            tokens[className] = value;
            tokens[dashesCamelCase(className)] = value;

            break;
          case "dashesOnly":
            tokens[dashesCamelCase(className)] = value;

            break;
        }

        return tokens;
      }, {});
    }

    if (opts.getJSON != undefined) {
      opts.getJSON(parser.exportTokens);
    }
  };
});