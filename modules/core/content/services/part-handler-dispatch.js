// DecentCMS (c) 2015 Bertrand Le Roy, under MIT. See LICENSE.txt for licensing details.
'use strict';

var async = require('async');

/**
 * This part handler dispatch handler calls part handlers.
 * The part handlers must implement a service name of the form
 * `[part-type]-part-handler`.
 * Part handlers take a context object and a callback function.
 * 
 * Param       | Type   | Description
 * ------------|--------|------------------------------------------------------------------
 * part        | *      | The part to handle.
 * partName    | string | The name of the part.
 * displayType | string | The display type.
 * item        | object | The content item that the part is a part of.
 * shapes      | Array  | The array of shapes that the part handler can push new shapes to.
 * scope       | object | The scope.
 */
var PartHandlerDispatch = {
  feature: 'content',
  service: 'shape-handler',
  /**
   * Calls part handlers for each part on `context.content.shape`.
   * @param {object} context The context object.
   * @param {object} context.shape The shape to handle. It has the content item for which the parts will be dispatched on its `temp.item`.
   * @param {object} context.scope The scope.
   * @param {Function} done The callback.
   */
  handle: function handleShapePart(context, done) {
    var content = context.shape;
    if (!content.meta
      || content.meta.type !== 'content'
      || !content.temp) {done(); return;}
    var temp = content.temp;
    var item = temp.item;
    var scope = context.scope;
    var contentManager = scope.require('content-manager');
    var type = contentManager.getType(item);
    async.each(Object.getOwnPropertyNames(item), function (partName, next) {
      if (partName === 'meta' || partName === 'temp') {next(); return;}
      var part = item[partName];
      if (!part) {next(); return;}
      var partType = part.meta && part.meta.type
        ? part.meta.type
        : type && type.parts && type.parts[partName]
        ? type.parts[partName].type
        : null;
      if (!partType) {next(); return;}
      scope.callService(partType + '-part-handler', 'handle', {
        part: part,
        partName: partName,
        displayType: temp.displayType,
        item: item,
        shapes: temp.shapes,
        scope: scope
      }, next);
    }, done);
  }
};

module.exports = PartHandlerDispatch;