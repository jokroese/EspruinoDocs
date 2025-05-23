/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- uiExt ------------------------- 20191006


*** ui base extension


The ui extension extend ui base with service and convenience functions for
ui frame work as well application


--- ext - ui extension properties - variables and methods - mixed into ui base:

 */
exports = // ui (generic) ext(ension/utils: vertices(circle,...) find elt/idx in arr,...)
{ mn: "uiExt" // module 'clazz' name - globally unique (used to remove code from cache)
, cvn: [[92,38,38,92,-38,92,-92,38,-92,-38,-38,-92,38,-92,92,-38]
       ,[98,20,83,56,56,83,20,98,-20,98,-56,83,-83,56,-98,20,-98,-20,-83,-56,-56,-83,-20,-98,20,-98,56,-83,83,-56,98,-20]]
, cvs: function(x,y,w) { // circle from vertices by bounding box w/ left, top and width
 var r=w/2,c=[x+r,y+r],z=r/100; return this.cvn[(w<12)?0:1].map((v,i) => c[i&1]+v*z); }
, vs2: function(x,y,x2,y2,p) { // vertices for for chk like shapes ('beveled') corners
 // 4 'beveled corners' = 8 corners defined by 0 and p insetting combinations for x, y
 return [x,y+p, x+p,y, x2-p,y, x2,y+p, x2,y2-p, x2-p,y2, x+p,y2, x,y2-p]; }
, vs3: function(x,y,x2,y2,p,q) { // return vertices for btn like shapes ('round' corners)
 // 12 'round corners' (4x3) defined by 0, p and q insetting combinations for x and y 
 return [ x,y+p,   x+q,y+q,   x+p,y, x2-p,y, x2-q,y+q, x2,y+p,
         x2,y2-p, x2-q,y2-q, x2-p,y2, x+p,y2, x+q,y2-q, x,y2-p]; }
, ff: function(a,f,s,_){ // find 1st in a-rray w/ condition f-unction from s-tart w/...
 var x = this.fx(a,f,s,_), u; return (x>=0) ? a[x] : u; } // ... _=this context
, fx: function(a,f,s,_){ var xm = a.length, x = (s||0)-1; // find idx in arr w/ cond...
 while (++x<xm) { if (f(a[x],_)) { return x; } } return -1; } // ... fn, start, _=this
, e: function(iie,s) { var _=_||this,t=typeof iie,u; return (("number"===t) // find e by idx,
 ? ((iie<0)?u:_.es[iie]):("string"===t) ? _.ff(_.es.slice(_.b,_.n),((iie.substr(-1)===".")
 ? function(e){ return ((e[1]==="rad") && (e[10][0]===iie)); } // ...radio grp id., ...
 : function(e){ return (e[2]===iie); }), s) : iie); } // ... or ui element id
, g: function(iie) { // get value / value obj of ui element by idx, id or element
 var e=this.e(iie), u; return (e) ? this[e[1]+"G"](e) : u; }
, u: function(iie,v,p) { // update val obj of ui elt by idx, id or elt...
 var _=_||this, e=_.e(iie), u; if (e) _[e[1]+"U"](_,e,v,p===u||p);
 return _; } // ...w/ (default, if not specified) and w/o propagation
};
