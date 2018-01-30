const svg = require('svgo');
const loaderUtils = require('loader-utils');
const compiler = require('vue-template-compiler');

module.exports = function (content) {
  const options = loaderUtils.getOptions(this) || {};
  const query = loaderUtils.parseQuery(this.resourceQuery || '?');
  

  this.cacheable && this.cacheable(true);
  this.addDependency(this.resourcePath);
  
  const cb = this.async();

  (function(){
    if(options.optimize){
      const svgo = new svg(options.svgo || {
         plugins: [{ removeDoctype: true }, { removeComments: true }],
      });
      
      return svgo.optimize(content)
        .then(function(result){ return result.data })
        .catch(function(result){return  cb(result.error)})
        
    }
    else {
      return Promise.resolve(content)
    }
  }()).then(function(content) {
    const compiled = compiler.compile(content, { preserveWhitespace: false });
    let component = `render: function () {${compiled.render}}`;

    if (options.includePath || query.includePath) {
      const filename = loaderUtils.interpolateName(this, '[path][name].[ext]', { context: this.options.context });
      component = `${component}, path:${JSON.stringify(filename)}`;
    }
    
    cb(null, `module.exports = {${component}};`);
  })



  
};
