import { c as commonjsGlobal } from './renderer-027b55ab.js';
import require$$0 from 'stream';
function _mergeNamespaces(n, m) {
  m.forEach(function (e) {
    e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
      if (k !== 'default' && !(k in n)) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () {
            return e[k];
          }
        });
      }
    });
  });
  return Object.freeze(n);
}
var papaparseExports = {};
var papaparse$2 = {
  get exports() {
    return papaparseExports;
  },
  set exports(v) {
    papaparseExports = v;
  }
};

/* @license
Papa Parse
v5.3.2
https://github.com/mholt/PapaParse
License: MIT
*/
(function (module, exports) {
  (function (root, factory) {
    {
      module.exports = factory();
    }
  })(commonjsGlobal, function moduleFactory() {
    var global = function () {
      if (typeof self !== 'undefined') {
        return self;
      }
      if (typeof window !== 'undefined') {
        return window;
      }
      if (typeof global !== 'undefined') {
        return global;
      }
      return {};
    }();
    function getWorkerBlob() {
      var URL = global.URL || global.webkitURL || null;
      var code = moduleFactory.toString();
      return Papa.BLOB_URL || (Papa.BLOB_URL = URL.createObjectURL(new Blob(['(', code, ')();'], {
        type: 'text/javascript'
      })));
    }
    var IS_WORKER = !global.document && !!global.postMessage,
      IS_PAPA_WORKER = IS_WORKER && /blob:/i.test((global.location || {}).protocol);
    var workers = {},
      workerIdCounter = 0;
    var Papa = {};
    Papa.parse = CsvToJson;
    Papa.unparse = JsonToCsv;
    Papa.RECORD_SEP = String.fromCharCode(30);
    Papa.UNIT_SEP = String.fromCharCode(31);
    Papa.BYTE_ORDER_MARK = '\ufeff';
    Papa.BAD_DELIMITERS = ['\r', '\n', '"', Papa.BYTE_ORDER_MARK];
    Papa.WORKERS_SUPPORTED = !IS_WORKER && !!global.Worker;
    Papa.NODE_STREAM_INPUT = 1;
    Papa.LocalChunkSize = 1024 * 1024 * 10;
    Papa.RemoteChunkSize = 1024 * 1024 * 5;
    Papa.DefaultDelimiter = ',';
    Papa.Parser = Parser;
    Papa.ParserHandle = ParserHandle;
    Papa.NetworkStreamer = NetworkStreamer;
    Papa.FileStreamer = FileStreamer;
    Papa.StringStreamer = StringStreamer;
    Papa.ReadableStreamStreamer = ReadableStreamStreamer;
    if (typeof PAPA_BROWSER_CONTEXT === 'undefined') {
      Papa.DuplexStreamStreamer = DuplexStreamStreamer;
    }
    if (global.jQuery) {
      var $ = global.jQuery;
      $.fn.parse = function (options) {
        var config = options.config || {};
        var queue = [];
        this.each(function (idx) {
          var supported = $(this).prop('tagName').toUpperCase() === 'INPUT' && $(this).attr('type').toLowerCase() === 'file' && global.FileReader;
          if (!supported || !this.files || this.files.length === 0) return true;
          for (var i = 0; i < this.files.length; i++) {
            queue.push({
              file: this.files[i],
              inputElem: this,
              instanceConfig: $.extend({}, config)
            });
          }
        });
        parseNextFile();
        return this;
        function parseNextFile() {
          if (queue.length === 0) {
            if (isFunction(options.complete)) options.complete();
            return;
          }
          var f = queue[0];
          if (isFunction(options.before)) {
            var returned = options.before(f.file, f.inputElem);
            if (typeof returned === 'object') {
              if (returned.action === 'abort') {
                error('AbortError', f.file, f.inputElem, returned.reason);
                return;
              } else if (returned.action === 'skip') {
                fileComplete();
                return;
              } else if (typeof returned.config === 'object') f.instanceConfig = $.extend(f.instanceConfig, returned.config);
            } else if (returned === 'skip') {
              fileComplete();
              return;
            }
          }
          var userCompleteFunc = f.instanceConfig.complete;
          f.instanceConfig.complete = function (results) {
            if (isFunction(userCompleteFunc)) userCompleteFunc(results, f.file, f.inputElem);
            fileComplete();
          };
          Papa.parse(f.file, f.instanceConfig);
        }
        function error(name, file, elem, reason) {
          if (isFunction(options.error)) options.error({
            name: name
          }, file, elem, reason);
        }
        function fileComplete() {
          queue.splice(0, 1);
          parseNextFile();
        }
      };
    }
    if (IS_PAPA_WORKER) {
      global.onmessage = workerThreadReceivedMessage;
    }
    function CsvToJson(_input, _config) {
      _config = _config || {};
      var dynamicTyping = _config.dynamicTyping || false;
      if (isFunction(dynamicTyping)) {
        _config.dynamicTypingFunction = dynamicTyping;
        dynamicTyping = {};
      }
      _config.dynamicTyping = dynamicTyping;
      _config.transform = isFunction(_config.transform) ? _config.transform : false;
      if (_config.worker && Papa.WORKERS_SUPPORTED) {
        var w = newWorker();
        w.userStep = _config.step;
        w.userChunk = _config.chunk;
        w.userComplete = _config.complete;
        w.userError = _config.error;
        _config.step = isFunction(_config.step);
        _config.chunk = isFunction(_config.chunk);
        _config.complete = isFunction(_config.complete);
        _config.error = isFunction(_config.error);
        delete _config.worker;
        w.postMessage({
          input: _input,
          config: _config,
          workerId: w.id
        });
        return;
      }
      var streamer = null;
      if (_input === Papa.NODE_STREAM_INPUT && typeof PAPA_BROWSER_CONTEXT === 'undefined') {
        streamer = new DuplexStreamStreamer(_config);
        return streamer.getStream();
      } else if (typeof _input === 'string') {
        if (_config.download) streamer = new NetworkStreamer(_config);else streamer = new StringStreamer(_config);
      } else if (_input.readable === true && isFunction(_input.read) && isFunction(_input.on)) {
        streamer = new ReadableStreamStreamer(_config);
      } else if (global.File && _input instanceof File || _input instanceof Object) streamer = new FileStreamer(_config);
      return streamer.stream(_input);
    }
    function JsonToCsv(_input, _config) {
      var _quotes = false;
      var _writeHeader = true;
      var _delimiter = ',';
      var _newline = '\r\n';
      var _quoteChar = '"';
      var _escapedQuote = _quoteChar + _quoteChar;
      var _skipEmptyLines = false;
      var _columns = null;
      var _escapeFormulae = false;
      unpackConfig();
      var quoteCharRegex = new RegExp(escapeRegExp(_quoteChar), 'g');
      if (typeof _input === 'string') _input = JSON.parse(_input);
      if (Array.isArray(_input)) {
        if (!_input.length || Array.isArray(_input[0])) return serialize(null, _input, _skipEmptyLines);else if (typeof _input[0] === 'object') return serialize(_columns || Object.keys(_input[0]), _input, _skipEmptyLines);
      } else if (typeof _input === 'object') {
        if (typeof _input.data === 'string') _input.data = JSON.parse(_input.data);
        if (Array.isArray(_input.data)) {
          if (!_input.fields) _input.fields = _input.meta && _input.meta.fields || _columns;
          if (!_input.fields) _input.fields = Array.isArray(_input.data[0]) ? _input.fields : typeof _input.data[0] === 'object' ? Object.keys(_input.data[0]) : [];
          if (!Array.isArray(_input.data[0]) && typeof _input.data[0] !== 'object') _input.data = [_input.data];
        }
        return serialize(_input.fields || [], _input.data || [], _skipEmptyLines);
      }
      throw new Error('Unable to serialize unrecognized input');
      function unpackConfig() {
        if (typeof _config !== 'object') return;
        if (typeof _config.delimiter === 'string' && !Papa.BAD_DELIMITERS.filter(function (value) {
          return _config.delimiter.indexOf(value) !== -1;
        }).length) {
          _delimiter = _config.delimiter;
        }
        if (typeof _config.quotes === 'boolean' || typeof _config.quotes === 'function' || Array.isArray(_config.quotes)) _quotes = _config.quotes;
        if (typeof _config.skipEmptyLines === 'boolean' || typeof _config.skipEmptyLines === 'string') _skipEmptyLines = _config.skipEmptyLines;
        if (typeof _config.newline === 'string') _newline = _config.newline;
        if (typeof _config.quoteChar === 'string') _quoteChar = _config.quoteChar;
        if (typeof _config.header === 'boolean') _writeHeader = _config.header;
        if (Array.isArray(_config.columns)) {
          if (_config.columns.length === 0) throw new Error('Option columns is empty');
          _columns = _config.columns;
        }
        if (_config.escapeChar !== undefined) {
          _escapedQuote = _config.escapeChar + _quoteChar;
        }
        if (typeof _config.escapeFormulae === 'boolean' || _config.escapeFormulae instanceof RegExp) {
          _escapeFormulae = _config.escapeFormulae instanceof RegExp ? _config.escapeFormulae : /^[=+\-@\t\r].*$/;
        }
      }
      function serialize(fields, data, skipEmptyLines) {
        var csv = '';
        if (typeof fields === 'string') fields = JSON.parse(fields);
        if (typeof data === 'string') data = JSON.parse(data);
        var hasHeader = Array.isArray(fields) && fields.length > 0;
        var dataKeyedByField = !Array.isArray(data[0]);
        if (hasHeader && _writeHeader) {
          for (var i = 0; i < fields.length; i++) {
            if (i > 0) csv += _delimiter;
            csv += safe(fields[i], i);
          }
          if (data.length > 0) csv += _newline;
        }
        for (var row = 0; row < data.length; row++) {
          var maxCol = hasHeader ? fields.length : data[row].length;
          var emptyLine = false;
          var nullLine = hasHeader ? Object.keys(data[row]).length === 0 : data[row].length === 0;
          if (skipEmptyLines && !hasHeader) {
            emptyLine = skipEmptyLines === 'greedy' ? data[row].join('').trim() === '' : data[row].length === 1 && data[row][0].length === 0;
          }
          if (skipEmptyLines === 'greedy' && hasHeader) {
            var line = [];
            for (var c = 0; c < maxCol; c++) {
              var cx = dataKeyedByField ? fields[c] : c;
              line.push(data[row][cx]);
            }
            emptyLine = line.join('').trim() === '';
          }
          if (!emptyLine) {
            for (var col = 0; col < maxCol; col++) {
              if (col > 0 && !nullLine) csv += _delimiter;
              var colIdx = hasHeader && dataKeyedByField ? fields[col] : col;
              csv += safe(data[row][colIdx], col);
            }
            if (row < data.length - 1 && (!skipEmptyLines || maxCol > 0 && !nullLine)) {
              csv += _newline;
            }
          }
        }
        return csv;
      }
      function safe(str, col) {
        if (typeof str === 'undefined' || str === null) return '';
        if (str.constructor === Date) return JSON.stringify(str).slice(1, 25);
        var needsQuotes = false;
        if (_escapeFormulae && typeof str === "string" && _escapeFormulae.test(str)) {
          str = "'" + str;
          needsQuotes = true;
        }
        var escapedQuoteStr = str.toString().replace(quoteCharRegex, _escapedQuote);
        needsQuotes = needsQuotes || _quotes === true || typeof _quotes === 'function' && _quotes(str, col) || Array.isArray(_quotes) && _quotes[col] || hasAny(escapedQuoteStr, Papa.BAD_DELIMITERS) || escapedQuoteStr.indexOf(_delimiter) > -1 || escapedQuoteStr.charAt(0) === ' ' || escapedQuoteStr.charAt(escapedQuoteStr.length - 1) === ' ';
        return needsQuotes ? _quoteChar + escapedQuoteStr + _quoteChar : escapedQuoteStr;
      }
      function hasAny(str, substrings) {
        for (var i = 0; i < substrings.length; i++) if (str.indexOf(substrings[i]) > -1) return true;
        return false;
      }
    }
    function ChunkStreamer(config) {
      this._handle = null;
      this._finished = false;
      this._completed = false;
      this._halted = false;
      this._input = null;
      this._baseIndex = 0;
      this._partialLine = '';
      this._rowCount = 0;
      this._start = 0;
      this._nextChunk = null;
      this.isFirstChunk = true;
      this._completeResults = {
        data: [],
        errors: [],
        meta: {}
      };
      replaceConfig.call(this, config);
      this.parseChunk = function (chunk, isFakeChunk) {
        if (this.isFirstChunk && isFunction(this._config.beforeFirstChunk)) {
          var modifiedChunk = this._config.beforeFirstChunk(chunk);
          if (modifiedChunk !== undefined) chunk = modifiedChunk;
        }
        this.isFirstChunk = false;
        this._halted = false;
        var aggregate = this._partialLine + chunk;
        this._partialLine = '';
        var results = this._handle.parse(aggregate, this._baseIndex, !this._finished);
        if (this._handle.paused() || this._handle.aborted()) {
          this._halted = true;
          return;
        }
        var lastIndex = results.meta.cursor;
        if (!this._finished) {
          this._partialLine = aggregate.substring(lastIndex - this._baseIndex);
          this._baseIndex = lastIndex;
        }
        if (results && results.data) this._rowCount += results.data.length;
        var finishedIncludingPreview = this._finished || this._config.preview && this._rowCount >= this._config.preview;
        if (IS_PAPA_WORKER) {
          global.postMessage({
            results: results,
            workerId: Papa.WORKER_ID,
            finished: finishedIncludingPreview
          });
        } else if (isFunction(this._config.chunk) && !isFakeChunk) {
          this._config.chunk(results, this._handle);
          if (this._handle.paused() || this._handle.aborted()) {
            this._halted = true;
            return;
          }
          results = undefined;
          this._completeResults = undefined;
        }
        if (!this._config.step && !this._config.chunk) {
          this._completeResults.data = this._completeResults.data.concat(results.data);
          this._completeResults.errors = this._completeResults.errors.concat(results.errors);
          this._completeResults.meta = results.meta;
        }
        if (!this._completed && finishedIncludingPreview && isFunction(this._config.complete) && (!results || !results.meta.aborted)) {
          this._config.complete(this._completeResults, this._input);
          this._completed = true;
        }
        if (!finishedIncludingPreview && (!results || !results.meta.paused)) this._nextChunk();
        return results;
      };
      this._sendError = function (error) {
        if (isFunction(this._config.error)) this._config.error(error);else if (IS_PAPA_WORKER && this._config.error) {
          global.postMessage({
            workerId: Papa.WORKER_ID,
            error: error,
            finished: false
          });
        }
      };
      function replaceConfig(config) {
        var configCopy = copy(config);
        configCopy.chunkSize = parseInt(configCopy.chunkSize);
        if (!config.step && !config.chunk) configCopy.chunkSize = null;
        this._handle = new ParserHandle(configCopy);
        this._handle.streamer = this;
        this._config = configCopy;
      }
    }
    function NetworkStreamer(config) {
      config = config || {};
      if (!config.chunkSize) config.chunkSize = Papa.RemoteChunkSize;
      ChunkStreamer.call(this, config);
      var xhr;
      if (IS_WORKER) {
        this._nextChunk = function () {
          this._readChunk();
          this._chunkLoaded();
        };
      } else {
        this._nextChunk = function () {
          this._readChunk();
        };
      }
      this.stream = function (url) {
        this._input = url;
        this._nextChunk();
      };
      this._readChunk = function () {
        if (this._finished) {
          this._chunkLoaded();
          return;
        }
        xhr = new XMLHttpRequest();
        if (this._config.withCredentials) {
          xhr.withCredentials = this._config.withCredentials;
        }
        if (!IS_WORKER) {
          xhr.onload = bindFunction(this._chunkLoaded, this);
          xhr.onerror = bindFunction(this._chunkError, this);
        }
        xhr.open(this._config.downloadRequestBody ? 'POST' : 'GET', this._input, !IS_WORKER);
        if (this._config.downloadRequestHeaders) {
          var headers = this._config.downloadRequestHeaders;
          for (var headerName in headers) {
            xhr.setRequestHeader(headerName, headers[headerName]);
          }
        }
        if (this._config.chunkSize) {
          var end = this._start + this._config.chunkSize - 1;
          xhr.setRequestHeader('Range', 'bytes=' + this._start + '-' + end);
        }
        try {
          xhr.send(this._config.downloadRequestBody);
        } catch (err) {
          this._chunkError(err.message);
        }
        if (IS_WORKER && xhr.status === 0) this._chunkError();
      };
      this._chunkLoaded = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status < 200 || xhr.status >= 400) {
          this._chunkError();
          return;
        }
        this._start += this._config.chunkSize ? this._config.chunkSize : xhr.responseText.length;
        this._finished = !this._config.chunkSize || this._start >= getFileSize(xhr);
        this.parseChunk(xhr.responseText);
      };
      this._chunkError = function (errorMessage) {
        var errorText = xhr.statusText || errorMessage;
        this._sendError(new Error(errorText));
      };
      function getFileSize(xhr) {
        var contentRange = xhr.getResponseHeader('Content-Range');
        if (contentRange === null) {
          return -1;
        }
        return parseInt(contentRange.substring(contentRange.lastIndexOf('/') + 1));
      }
    }
    NetworkStreamer.prototype = Object.create(ChunkStreamer.prototype);
    NetworkStreamer.prototype.constructor = NetworkStreamer;
    function FileStreamer(config) {
      config = config || {};
      if (!config.chunkSize) config.chunkSize = Papa.LocalChunkSize;
      ChunkStreamer.call(this, config);
      var reader, slice;
      var usingAsyncReader = typeof FileReader !== 'undefined';
      this.stream = function (file) {
        this._input = file;
        slice = file.slice || file.webkitSlice || file.mozSlice;
        if (usingAsyncReader) {
          reader = new FileReader();
          reader.onload = bindFunction(this._chunkLoaded, this);
          reader.onerror = bindFunction(this._chunkError, this);
        } else reader = new FileReaderSync();
        this._nextChunk();
      };
      this._nextChunk = function () {
        if (!this._finished && (!this._config.preview || this._rowCount < this._config.preview)) this._readChunk();
      };
      this._readChunk = function () {
        var input = this._input;
        if (this._config.chunkSize) {
          var end = Math.min(this._start + this._config.chunkSize, this._input.size);
          input = slice.call(input, this._start, end);
        }
        var txt = reader.readAsText(input, this._config.encoding);
        if (!usingAsyncReader) this._chunkLoaded({
          target: {
            result: txt
          }
        });
      };
      this._chunkLoaded = function (event) {
        this._start += this._config.chunkSize;
        this._finished = !this._config.chunkSize || this._start >= this._input.size;
        this.parseChunk(event.target.result);
      };
      this._chunkError = function () {
        this._sendError(reader.error);
      };
    }
    FileStreamer.prototype = Object.create(ChunkStreamer.prototype);
    FileStreamer.prototype.constructor = FileStreamer;
    function StringStreamer(config) {
      config = config || {};
      ChunkStreamer.call(this, config);
      var remaining;
      this.stream = function (s) {
        remaining = s;
        return this._nextChunk();
      };
      this._nextChunk = function () {
        if (this._finished) return;
        var size = this._config.chunkSize;
        var chunk;
        if (size) {
          chunk = remaining.substring(0, size);
          remaining = remaining.substring(size);
        } else {
          chunk = remaining;
          remaining = '';
        }
        this._finished = !remaining;
        return this.parseChunk(chunk);
      };
    }
    StringStreamer.prototype = Object.create(StringStreamer.prototype);
    StringStreamer.prototype.constructor = StringStreamer;
    function ReadableStreamStreamer(config) {
      config = config || {};
      ChunkStreamer.call(this, config);
      var queue = [];
      var parseOnData = true;
      var streamHasEnded = false;
      this.pause = function () {
        ChunkStreamer.prototype.pause.apply(this, arguments);
        this._input.pause();
      };
      this.resume = function () {
        ChunkStreamer.prototype.resume.apply(this, arguments);
        this._input.resume();
      };
      this.stream = function (stream) {
        this._input = stream;
        this._input.on('data', this._streamData);
        this._input.on('end', this._streamEnd);
        this._input.on('error', this._streamError);
      };
      this._checkIsFinished = function () {
        if (streamHasEnded && queue.length === 1) {
          this._finished = true;
        }
      };
      this._nextChunk = function () {
        this._checkIsFinished();
        if (queue.length) {
          this.parseChunk(queue.shift());
        } else {
          parseOnData = true;
        }
      };
      this._streamData = bindFunction(function (chunk) {
        try {
          queue.push(typeof chunk === 'string' ? chunk : chunk.toString(this._config.encoding));
          if (parseOnData) {
            parseOnData = false;
            this._checkIsFinished();
            this.parseChunk(queue.shift());
          }
        } catch (error) {
          this._streamError(error);
        }
      }, this);
      this._streamError = bindFunction(function (error) {
        this._streamCleanUp();
        this._sendError(error);
      }, this);
      this._streamEnd = bindFunction(function () {
        this._streamCleanUp();
        streamHasEnded = true;
        this._streamData('');
      }, this);
      this._streamCleanUp = bindFunction(function () {
        this._input.removeListener('data', this._streamData);
        this._input.removeListener('end', this._streamEnd);
        this._input.removeListener('error', this._streamError);
      }, this);
    }
    ReadableStreamStreamer.prototype = Object.create(ChunkStreamer.prototype);
    ReadableStreamStreamer.prototype.constructor = ReadableStreamStreamer;
    function DuplexStreamStreamer(_config) {
      var Duplex = require$$0.Duplex;
      var config = copy(_config);
      var parseOnWrite = true;
      var writeStreamHasFinished = false;
      var parseCallbackQueue = [];
      var stream = null;
      this._onCsvData = function (results) {
        var data = results.data;
        if (!stream.push(data) && !this._handle.paused()) {
          this._handle.pause();
        }
      };
      this._onCsvComplete = function () {
        stream.push(null);
      };
      config.step = bindFunction(this._onCsvData, this);
      config.complete = bindFunction(this._onCsvComplete, this);
      ChunkStreamer.call(this, config);
      this._nextChunk = function () {
        if (writeStreamHasFinished && parseCallbackQueue.length === 1) {
          this._finished = true;
        }
        if (parseCallbackQueue.length) {
          parseCallbackQueue.shift()();
        } else {
          parseOnWrite = true;
        }
      };
      this._addToParseQueue = function (chunk, callback) {
        parseCallbackQueue.push(bindFunction(function () {
          this.parseChunk(typeof chunk === 'string' ? chunk : chunk.toString(config.encoding));
          if (isFunction(callback)) {
            return callback();
          }
        }, this));
        if (parseOnWrite) {
          parseOnWrite = false;
          this._nextChunk();
        }
      };
      this._onRead = function () {
        if (this._handle.paused()) {
          this._handle.resume();
        }
      };
      this._onWrite = function (chunk, encoding, callback) {
        this._addToParseQueue(chunk, callback);
      };
      this._onWriteComplete = function () {
        writeStreamHasFinished = true;
        this._addToParseQueue('');
      };
      this.getStream = function () {
        return stream;
      };
      stream = new Duplex({
        readableObjectMode: true,
        decodeStrings: false,
        read: bindFunction(this._onRead, this),
        write: bindFunction(this._onWrite, this)
      });
      stream.once('finish', bindFunction(this._onWriteComplete, this));
    }
    if (typeof PAPA_BROWSER_CONTEXT === 'undefined') {
      DuplexStreamStreamer.prototype = Object.create(ChunkStreamer.prototype);
      DuplexStreamStreamer.prototype.constructor = DuplexStreamStreamer;
    }
    function ParserHandle(_config) {
      var MAX_FLOAT = Math.pow(2, 53);
      var MIN_FLOAT = -MAX_FLOAT;
      var FLOAT = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/;
      var ISO_DATE = /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/;
      var self = this;
      var _stepCounter = 0;
      var _rowCounter = 0;
      var _input;
      var _parser;
      var _paused = false;
      var _aborted = false;
      var _delimiterError;
      var _fields = [];
      var _results = {
        data: [],
        errors: [],
        meta: {}
      };
      if (isFunction(_config.step)) {
        var userStep = _config.step;
        _config.step = function (results) {
          _results = results;
          if (needsHeaderRow()) processResults();else {
            processResults();
            if (_results.data.length === 0) return;
            _stepCounter += results.data.length;
            if (_config.preview && _stepCounter > _config.preview) _parser.abort();else {
              _results.data = _results.data[0];
              userStep(_results, self);
            }
          }
        };
      }
      this.parse = function (input, baseIndex, ignoreLastRow) {
        var quoteChar = _config.quoteChar || '"';
        if (!_config.newline) _config.newline = guessLineEndings(input, quoteChar);
        _delimiterError = false;
        if (!_config.delimiter) {
          var delimGuess = guessDelimiter(input, _config.newline, _config.skipEmptyLines, _config.comments, _config.delimitersToGuess);
          if (delimGuess.successful) _config.delimiter = delimGuess.bestDelimiter;else {
            _delimiterError = true;
            _config.delimiter = Papa.DefaultDelimiter;
          }
          _results.meta.delimiter = _config.delimiter;
        } else if (isFunction(_config.delimiter)) {
          _config.delimiter = _config.delimiter(input);
          _results.meta.delimiter = _config.delimiter;
        }
        var parserConfig = copy(_config);
        if (_config.preview && _config.header) parserConfig.preview++;
        _input = input;
        _parser = new Parser(parserConfig);
        _results = _parser.parse(_input, baseIndex, ignoreLastRow);
        processResults();
        return _paused ? {
          meta: {
            paused: true
          }
        } : _results || {
          meta: {
            paused: false
          }
        };
      };
      this.paused = function () {
        return _paused;
      };
      this.pause = function () {
        _paused = true;
        _parser.abort();
        _input = isFunction(_config.chunk) ? "" : _input.substring(_parser.getCharIndex());
      };
      this.resume = function () {
        if (self.streamer._halted) {
          _paused = false;
          self.streamer.parseChunk(_input, true);
        } else {
          setTimeout(self.resume, 3);
        }
      };
      this.aborted = function () {
        return _aborted;
      };
      this.abort = function () {
        _aborted = true;
        _parser.abort();
        _results.meta.aborted = true;
        if (isFunction(_config.complete)) _config.complete(_results);
        _input = '';
      };
      function testEmptyLine(s) {
        return _config.skipEmptyLines === 'greedy' ? s.join('').trim() === '' : s.length === 1 && s[0].length === 0;
      }
      function testFloat(s) {
        if (FLOAT.test(s)) {
          var floatValue = parseFloat(s);
          if (floatValue > MIN_FLOAT && floatValue < MAX_FLOAT) {
            return true;
          }
        }
        return false;
      }
      function processResults() {
        if (_results && _delimiterError) {
          addError('Delimiter', 'UndetectableDelimiter', 'Unable to auto-detect delimiting character; defaulted to \'' + Papa.DefaultDelimiter + '\'');
          _delimiterError = false;
        }
        if (_config.skipEmptyLines) {
          _results.data = _results.data.filter(function (d) {
            return !testEmptyLine(d);
          });
        }
        if (needsHeaderRow()) fillHeaderFields();
        return applyHeaderAndDynamicTypingAndTransformation();
      }
      function needsHeaderRow() {
        return _config.header && _fields.length === 0;
      }
      function fillHeaderFields() {
        if (!_results) return;
        function addHeader(header, i) {
          if (isFunction(_config.transformHeader)) header = _config.transformHeader(header, i);
          _fields.push(header);
        }
        if (Array.isArray(_results.data[0])) {
          for (var i = 0; needsHeaderRow() && i < _results.data.length; i++) _results.data[i].forEach(addHeader);
          _results.data.splice(0, 1);
        } else _results.data.forEach(addHeader);
      }
      function shouldApplyDynamicTyping(field) {
        if (_config.dynamicTypingFunction && _config.dynamicTyping[field] === undefined) {
          _config.dynamicTyping[field] = _config.dynamicTypingFunction(field);
        }
        return (_config.dynamicTyping[field] || _config.dynamicTyping) === true;
      }
      function parseDynamic(field, value) {
        if (shouldApplyDynamicTyping(field)) {
          if (value === 'true' || value === 'TRUE') return true;else if (value === 'false' || value === 'FALSE') return false;else if (testFloat(value)) return parseFloat(value);else if (ISO_DATE.test(value)) return new Date(value);else return value === '' ? null : value;
        }
        return value;
      }
      function applyHeaderAndDynamicTypingAndTransformation() {
        if (!_results || !_config.header && !_config.dynamicTyping && !_config.transform) return _results;
        function processRow(rowSource, i) {
          var row = _config.header ? {} : [];
          var j;
          for (j = 0; j < rowSource.length; j++) {
            var field = j;
            var value = rowSource[j];
            if (_config.header) field = j >= _fields.length ? '__parsed_extra' : _fields[j];
            if (_config.transform) value = _config.transform(value, field);
            value = parseDynamic(field, value);
            if (field === '__parsed_extra') {
              row[field] = row[field] || [];
              row[field].push(value);
            } else row[field] = value;
          }
          if (_config.header) {
            if (j > _fields.length) addError('FieldMismatch', 'TooManyFields', 'Too many fields: expected ' + _fields.length + ' fields but parsed ' + j, _rowCounter + i);else if (j < _fields.length) addError('FieldMismatch', 'TooFewFields', 'Too few fields: expected ' + _fields.length + ' fields but parsed ' + j, _rowCounter + i);
          }
          return row;
        }
        var incrementBy = 1;
        if (!_results.data.length || Array.isArray(_results.data[0])) {
          _results.data = _results.data.map(processRow);
          incrementBy = _results.data.length;
        } else _results.data = processRow(_results.data, 0);
        if (_config.header && _results.meta) _results.meta.fields = _fields;
        _rowCounter += incrementBy;
        return _results;
      }
      function guessDelimiter(input, newline, skipEmptyLines, comments, delimitersToGuess) {
        var bestDelim, bestDelta, fieldCountPrevRow, maxFieldCount;
        delimitersToGuess = delimitersToGuess || [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP];
        for (var i = 0; i < delimitersToGuess.length; i++) {
          var delim = delimitersToGuess[i];
          var delta = 0,
            avgFieldCount = 0,
            emptyLinesCount = 0;
          fieldCountPrevRow = undefined;
          var preview = new Parser({
            comments: comments,
            delimiter: delim,
            newline: newline,
            preview: 10
          }).parse(input);
          for (var j = 0; j < preview.data.length; j++) {
            if (skipEmptyLines && testEmptyLine(preview.data[j])) {
              emptyLinesCount++;
              continue;
            }
            var fieldCount = preview.data[j].length;
            avgFieldCount += fieldCount;
            if (typeof fieldCountPrevRow === 'undefined') {
              fieldCountPrevRow = fieldCount;
              continue;
            } else if (fieldCount > 0) {
              delta += Math.abs(fieldCount - fieldCountPrevRow);
              fieldCountPrevRow = fieldCount;
            }
          }
          if (preview.data.length > 0) avgFieldCount /= preview.data.length - emptyLinesCount;
          if ((typeof bestDelta === 'undefined' || delta <= bestDelta) && (typeof maxFieldCount === 'undefined' || avgFieldCount > maxFieldCount) && avgFieldCount > 1.99) {
            bestDelta = delta;
            bestDelim = delim;
            maxFieldCount = avgFieldCount;
          }
        }
        _config.delimiter = bestDelim;
        return {
          successful: !!bestDelim,
          bestDelimiter: bestDelim
        };
      }
      function guessLineEndings(input, quoteChar) {
        input = input.substring(0, 1024 * 1024);
        var re = new RegExp(escapeRegExp(quoteChar) + '([^]*?)' + escapeRegExp(quoteChar), 'gm');
        input = input.replace(re, '');
        var r = input.split('\r');
        var n = input.split('\n');
        var nAppearsFirst = n.length > 1 && n[0].length < r[0].length;
        if (r.length === 1 || nAppearsFirst) return '\n';
        var numWithN = 0;
        for (var i = 0; i < r.length; i++) {
          if (r[i][0] === '\n') numWithN++;
        }
        return numWithN >= r.length / 2 ? '\r\n' : '\r';
      }
      function addError(type, code, msg, row) {
        var error = {
          type: type,
          code: code,
          message: msg
        };
        if (row !== undefined) {
          error.row = row;
        }
        _results.errors.push(error);
      }
    }
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function Parser(config) {
      config = config || {};
      var delim = config.delimiter;
      var newline = config.newline;
      var comments = config.comments;
      var step = config.step;
      var preview = config.preview;
      var fastMode = config.fastMode;
      var quoteChar;
      if (config.quoteChar === undefined || config.quoteChar === null) {
        quoteChar = '"';
      } else {
        quoteChar = config.quoteChar;
      }
      var escapeChar = quoteChar;
      if (config.escapeChar !== undefined) {
        escapeChar = config.escapeChar;
      }
      if (typeof delim !== 'string' || Papa.BAD_DELIMITERS.indexOf(delim) > -1) delim = ',';
      if (comments === delim) throw new Error('Comment character same as delimiter');else if (comments === true) comments = '#';else if (typeof comments !== 'string' || Papa.BAD_DELIMITERS.indexOf(comments) > -1) comments = false;
      if (newline !== '\n' && newline !== '\r' && newline !== '\r\n') newline = '\n';
      var cursor = 0;
      var aborted = false;
      this.parse = function (input, baseIndex, ignoreLastRow) {
        if (typeof input !== 'string') throw new Error('Input must be a string');
        var inputLen = input.length,
          delimLen = delim.length,
          newlineLen = newline.length,
          commentsLen = comments.length;
        var stepIsFunction = isFunction(step);
        cursor = 0;
        var data = [],
          errors = [],
          row = [],
          lastCursor = 0;
        if (!input) return returnable();
        if (fastMode || fastMode !== false && input.indexOf(quoteChar) === -1) {
          var rows = input.split(newline);
          for (var i = 0; i < rows.length; i++) {
            row = rows[i];
            cursor += row.length;
            if (i !== rows.length - 1) cursor += newline.length;else if (ignoreLastRow) return returnable();
            if (comments && row.substring(0, commentsLen) === comments) continue;
            if (stepIsFunction) {
              data = [];
              pushRow(row.split(delim));
              doStep();
              if (aborted) return returnable();
            } else pushRow(row.split(delim));
            if (preview && i >= preview) {
              data = data.slice(0, preview);
              return returnable(true);
            }
          }
          return returnable();
        }
        var nextDelim = input.indexOf(delim, cursor);
        var nextNewline = input.indexOf(newline, cursor);
        var quoteCharRegex = new RegExp(escapeRegExp(escapeChar) + escapeRegExp(quoteChar), 'g');
        var quoteSearch = input.indexOf(quoteChar, cursor);
        for (;;) {
          if (input[cursor] === quoteChar) {
            quoteSearch = cursor;
            cursor++;
            for (;;) {
              quoteSearch = input.indexOf(quoteChar, quoteSearch + 1);
              if (quoteSearch === -1) {
                if (!ignoreLastRow) {
                  errors.push({
                    type: 'Quotes',
                    code: 'MissingQuotes',
                    message: 'Quoted field unterminated',
                    row: data.length,
                    index: cursor
                  });
                }
                return finish();
              }
              if (quoteSearch === inputLen - 1) {
                var value = input.substring(cursor, quoteSearch).replace(quoteCharRegex, quoteChar);
                return finish(value);
              }
              if (quoteChar === escapeChar && input[quoteSearch + 1] === escapeChar) {
                quoteSearch++;
                continue;
              }
              if (quoteChar !== escapeChar && quoteSearch !== 0 && input[quoteSearch - 1] === escapeChar) {
                continue;
              }
              if (nextDelim !== -1 && nextDelim < quoteSearch + 1) {
                nextDelim = input.indexOf(delim, quoteSearch + 1);
              }
              if (nextNewline !== -1 && nextNewline < quoteSearch + 1) {
                nextNewline = input.indexOf(newline, quoteSearch + 1);
              }
              var checkUpTo = nextNewline === -1 ? nextDelim : Math.min(nextDelim, nextNewline);
              var spacesBetweenQuoteAndDelimiter = extraSpaces(checkUpTo);
              if (input.substr(quoteSearch + 1 + spacesBetweenQuoteAndDelimiter, delimLen) === delim) {
                row.push(input.substring(cursor, quoteSearch).replace(quoteCharRegex, quoteChar));
                cursor = quoteSearch + 1 + spacesBetweenQuoteAndDelimiter + delimLen;
                if (input[quoteSearch + 1 + spacesBetweenQuoteAndDelimiter + delimLen] !== quoteChar) {
                  quoteSearch = input.indexOf(quoteChar, cursor);
                }
                nextDelim = input.indexOf(delim, cursor);
                nextNewline = input.indexOf(newline, cursor);
                break;
              }
              var spacesBetweenQuoteAndNewLine = extraSpaces(nextNewline);
              if (input.substring(quoteSearch + 1 + spacesBetweenQuoteAndNewLine, quoteSearch + 1 + spacesBetweenQuoteAndNewLine + newlineLen) === newline) {
                row.push(input.substring(cursor, quoteSearch).replace(quoteCharRegex, quoteChar));
                saveRow(quoteSearch + 1 + spacesBetweenQuoteAndNewLine + newlineLen);
                nextDelim = input.indexOf(delim, cursor);
                quoteSearch = input.indexOf(quoteChar, cursor);
                if (stepIsFunction) {
                  doStep();
                  if (aborted) return returnable();
                }
                if (preview && data.length >= preview) return returnable(true);
                break;
              }
              errors.push({
                type: 'Quotes',
                code: 'InvalidQuotes',
                message: 'Trailing quote on quoted field is malformed',
                row: data.length,
                index: cursor
              });
              quoteSearch++;
              continue;
            }
            continue;
          }
          if (comments && row.length === 0 && input.substring(cursor, cursor + commentsLen) === comments) {
            if (nextNewline === -1) return returnable();
            cursor = nextNewline + newlineLen;
            nextNewline = input.indexOf(newline, cursor);
            nextDelim = input.indexOf(delim, cursor);
            continue;
          }
          if (nextDelim !== -1 && (nextDelim < nextNewline || nextNewline === -1)) {
            row.push(input.substring(cursor, nextDelim));
            cursor = nextDelim + delimLen;
            nextDelim = input.indexOf(delim, cursor);
            continue;
          }
          if (nextNewline !== -1) {
            row.push(input.substring(cursor, nextNewline));
            saveRow(nextNewline + newlineLen);
            if (stepIsFunction) {
              doStep();
              if (aborted) return returnable();
            }
            if (preview && data.length >= preview) return returnable(true);
            continue;
          }
          break;
        }
        return finish();
        function pushRow(row) {
          data.push(row);
          lastCursor = cursor;
        }
        function extraSpaces(index) {
          var spaceLength = 0;
          if (index !== -1) {
            var textBetweenClosingQuoteAndIndex = input.substring(quoteSearch + 1, index);
            if (textBetweenClosingQuoteAndIndex && textBetweenClosingQuoteAndIndex.trim() === '') {
              spaceLength = textBetweenClosingQuoteAndIndex.length;
            }
          }
          return spaceLength;
        }
        function finish(value) {
          if (ignoreLastRow) return returnable();
          if (typeof value === 'undefined') value = input.substring(cursor);
          row.push(value);
          cursor = inputLen;
          pushRow(row);
          if (stepIsFunction) doStep();
          return returnable();
        }
        function saveRow(newCursor) {
          cursor = newCursor;
          pushRow(row);
          row = [];
          nextNewline = input.indexOf(newline, cursor);
        }
        function returnable(stopped) {
          return {
            data: data,
            errors: errors,
            meta: {
              delimiter: delim,
              linebreak: newline,
              aborted: aborted,
              truncated: !!stopped,
              cursor: lastCursor + (baseIndex || 0)
            }
          };
        }
        function doStep() {
          step(returnable());
          data = [];
          errors = [];
        }
      };
      this.abort = function () {
        aborted = true;
      };
      this.getCharIndex = function () {
        return cursor;
      };
    }
    function newWorker() {
      if (!Papa.WORKERS_SUPPORTED) return false;
      var workerUrl = getWorkerBlob();
      var w = new global.Worker(workerUrl);
      w.onmessage = mainThreadReceivedMessage;
      w.id = workerIdCounter++;
      workers[w.id] = w;
      return w;
    }
    function mainThreadReceivedMessage(e) {
      var msg = e.data;
      var worker = workers[msg.workerId];
      var aborted = false;
      if (msg.error) worker.userError(msg.error, msg.file);else if (msg.results && msg.results.data) {
        var abort = function () {
          aborted = true;
          completeWorker(msg.workerId, {
            data: [],
            errors: [],
            meta: {
              aborted: true
            }
          });
        };
        var handle = {
          abort: abort,
          pause: notImplemented,
          resume: notImplemented
        };
        if (isFunction(worker.userStep)) {
          for (var i = 0; i < msg.results.data.length; i++) {
            worker.userStep({
              data: msg.results.data[i],
              errors: msg.results.errors,
              meta: msg.results.meta
            }, handle);
            if (aborted) break;
          }
          delete msg.results;
        } else if (isFunction(worker.userChunk)) {
          worker.userChunk(msg.results, handle, msg.file);
          delete msg.results;
        }
      }
      if (msg.finished && !aborted) completeWorker(msg.workerId, msg.results);
    }
    function completeWorker(workerId, results) {
      var worker = workers[workerId];
      if (isFunction(worker.userComplete)) worker.userComplete(results);
      worker.terminate();
      delete workers[workerId];
    }
    function notImplemented() {
      throw new Error('Not implemented.');
    }
    function workerThreadReceivedMessage(e) {
      var msg = e.data;
      if (typeof Papa.WORKER_ID === 'undefined' && msg) Papa.WORKER_ID = msg.workerId;
      if (typeof msg.input === 'string') {
        global.postMessage({
          workerId: Papa.WORKER_ID,
          results: Papa.parse(msg.input, msg.config),
          finished: true
        });
      } else if (global.File && msg.input instanceof File || msg.input instanceof Object) {
        var results = Papa.parse(msg.input, msg.config);
        if (results) global.postMessage({
          workerId: Papa.WORKER_ID,
          results: results,
          finished: true
        });
      }
    }
    function copy(obj) {
      if (typeof obj !== 'object' || obj === null) return obj;
      var cpy = Array.isArray(obj) ? [] : {};
      for (var key in obj) cpy[key] = copy(obj[key]);
      return cpy;
    }
    function bindFunction(f, self) {
      return function () {
        f.apply(self, arguments);
      };
    }
    function isFunction(func) {
      return typeof func === 'function';
    }
    return Papa;
  });
})(papaparse$2);
var papaparse = papaparseExports;
var papaparse$1 = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  'default': papaparse
}, [papaparseExports]);
export { papaparse$1 as p };
