// //Adapted from: https://codepen.io/davidhartley/pen/seEki?editors=0010

// var width = window.innerWidth;
// var height = window.innerHeight;
// var renderer = new PIXI.autoDetectRenderer(width, height);//Chooses either WebGL if supported or falls back to Canvas rendering
// document.body.appendChild(renderer.view);//Add the render view object into the page

// var stage = new PIXI.Container();//The stage is the root container that will hold everything in our scene

// // grid shader
// var uniforms = {};
// uniforms.vpw = width;
// uniforms.vph = height;
// uniforms.offset = { type: 'v2', value: { x: -0.0235, y: 0.9794}}
// uniforms.pitch = { type: 'v2', value: { x: 50, y: 50}}
// uniforms.resolution = { type: 'v2', value: { x: width, y: height}};

// var shaderCode = document.getElementById( 'fragShader' ).innerHTML
// var gridShader = new PIXI.AbstractFilter('',shaderCode, uniforms);
// const rect = new PIXI.Graphics().drawRect(0, 0, width, height);
// rect.filters = [gridShader];
// stage.addChild(rect);

// // this is the main render call that makes pixi draw your container and its children.
// renderer.render(stage);
