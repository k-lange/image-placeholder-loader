var gm = require('gm');
var loaderUtils = require('loader-utils');
var mime = require('mime');

module.exports = loader;
module.exports.raw = true;

function loader (content) {
    this.cacheable();
    var callback = this.async();
    var src = emitFile(this, content);

    Promise.all([
        getSizePromise(),
        getResizePromise().then(getDataUrl.bind(null, this.resourcePath))
    ]).then(function (values) {
        var size = values[0];
        var placeholder = values[1];
        var output = {
            width: size.width,
            height: size.height,
            placeholder: placeholder,
            src: src
        };

        callback('module.exports = ' + JSON.stringify(output));
    });
}

function getSizePromise(content) {
    return new Promise(function (resolve, reject) {
        gm(content).size(function (err, size) {
            if (err) { reject(err); }
            resolve(size);
        });
    });
}

function getResizePromise(content) {
    return new Promise(function (resolve, reject) {
        gm(content).resize(30).toBuffer(function (err, buffer) {
            if (err) { reject(err); }
            resolve(buffer);
        });
    });
}

function emitFile(context, content) {
    var url = loaderUtils.interpolateName(context, '[hash].[ext]', {
        context: context.options.context,
        content: content
    });

    context.emitFile(url, content);

    return url;
}

function getDataUrl(path, content) {
    var mimeType = mime.lookup(path);
    return 'data:' +  (mimetype ? mimetype + ';' : '') + 'base64,' + content.toString('base64');
}
