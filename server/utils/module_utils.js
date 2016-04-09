/**
* Checks if a given module has been invoked as an individual script or loaded by
* another node module.
* @returns {boolean}
**/
function isExecutedAsScript(module) {
  return require.main === module;
}
export { isExecutedAsScript };
