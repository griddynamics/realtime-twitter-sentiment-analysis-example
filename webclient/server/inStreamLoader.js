/*eslint no-unused-vars: 1*/
/* global scriptFiles */
function remoteLoad(uri) {
  window.socketIoUrl = uri;

  var scriptTag = [
    '<script src="',
    '',
    '"><\/script>'
  ];
  scriptFiles.forEach(
    function (fileName) {
      var file = uri + fileName.substr(1);
      scriptTag[1] = file;
      document.write(scriptTag.join(''));
    }
  );
}
