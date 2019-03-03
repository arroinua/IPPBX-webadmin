/*!
  Copyright (c) 2016 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				classes.push(classNames.apply(null, arg));
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// register as 'classnames', consistent with npm package name
		define('classnames', [], function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
}());

!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.AutosizeInput=e()}}(function(){return function e(t,i,n){function s(r,p){if(!i[r]){if(!t[r]){var l="function"==typeof require&&require;if(!p&&l)return l(r,!0);if(o)return o(r,!0);var f=new Error("Cannot find module '"+r+"'");throw f.code="MODULE_NOT_FOUND",f}var u=i[r]={exports:{}};t[r][0].call(u.exports,function(e){var i=t[r][1][e];return s(i?i:e)},u,u.exports,e,t,i,n)}return i[r].exports}for(var o="function"==typeof require&&require,r=0;r<n.length;r++)s(n[r]);return s}({1:[function(e,t,i){(function(e){"use strict";var i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var i=arguments[t];for(var n in i)Object.prototype.hasOwnProperty.call(i,n)&&(e[n]=i[n])}return e},n="undefined"!=typeof window?window.React:"undefined"!=typeof e?e.React:null,s={position:"absolute",top:0,left:0,visibility:"hidden",height:0,overflow:"scroll",whiteSpace:"pre"},o=n.createClass({displayName:"AutosizeInput",propTypes:{className:n.PropTypes.string,defaultValue:n.PropTypes.any,inputClassName:n.PropTypes.string,inputStyle:n.PropTypes.object,minWidth:n.PropTypes.oneOfType([n.PropTypes.number,n.PropTypes.string]),onChange:n.PropTypes.func,placeholder:n.PropTypes.string,placeholderIsMinWidth:n.PropTypes.bool,style:n.PropTypes.object,value:n.PropTypes.any},getDefaultProps:function(){return{minWidth:1}},getInitialState:function(){return{inputWidth:this.props.minWidth}},componentDidMount:function(){this.copyInputStyles(),this.updateInputWidth()},componentDidUpdate:function(){this.updateInputWidth()},copyInputStyles:function(){if(this.isMounted()&&window.getComputedStyle){var e=window.getComputedStyle(this.refs.input);if(e){var t=this.refs.sizer;if(t.style.fontSize=e.fontSize,t.style.fontFamily=e.fontFamily,t.style.fontWeight=e.fontWeight,t.style.fontStyle=e.fontStyle,t.style.letterSpacing=e.letterSpacing,this.props.placeholder){var i=this.refs.placeholderSizer;i.style.fontSize=e.fontSize,i.style.fontFamily=e.fontFamily,i.style.fontWeight=e.fontWeight,i.style.fontStyle=e.fontStyle,i.style.letterSpacing=e.letterSpacing}}}},updateInputWidth:function(){if(this.isMounted()&&"undefined"!=typeof this.refs.sizer.scrollWidth){var e=void 0;e=this.props.placeholder&&(!this.props.value||this.props.value&&this.props.placeholderIsMinWidth)?Math.max(this.refs.sizer.scrollWidth,this.refs.placeholderSizer.scrollWidth)+2:this.refs.sizer.scrollWidth+2,e<this.props.minWidth&&(e=this.props.minWidth),e!==this.state.inputWidth&&this.setState({inputWidth:e})}},getInput:function(){return this.refs.input},focus:function(){this.refs.input.focus()},blur:function(){this.refs.input.blur()},select:function(){this.refs.input.select()},render:function(){var e=this.props.defaultValue||this.props.value||"",t=this.props.style||{};t.display||(t.display="inline-block");var o=i({},this.props.inputStyle);o.width=this.state.inputWidth+"px",o.boxSizing="content-box";var r=i({},this.props);return r.className=this.props.inputClassName,r.style=o,delete r.inputClassName,delete r.inputStyle,delete r.minWidth,delete r.placeholderIsMinWidth,n.createElement("div",{className:this.props.className,style:t},n.createElement("input",i({},r,{ref:"input"})),n.createElement("div",{ref:"sizer",style:s},e),this.props.placeholder?n.createElement("div",{ref:"placeholderSizer",style:s},this.props.placeholder):null)}});t.exports=o}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)});