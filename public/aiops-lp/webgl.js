// Shape Waves, adapted for this site's WebGL renderer from React Bits.
// Copyright (c) 2026 David Haz. See THIRD-PARTY-NOTICES.txt.
// https://reactbits.dev/backgrounds/shape-waves
// The reference credits https://vercel.com/labs as its inspiration.
import { RippleField } from './ripple-field.js';

const vertexSource = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() { vUv = aPosition * 0.5 + 0.5; gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

const fragmentSource = `
precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uMaskPlacement;
uniform vec4 uGrid;
uniform float uTime;
uniform float uIntro;
uniform sampler2D uMask;
uniform sampler2D uCharges;

vec3 mod289(vec3 x) { return x - floor(x / 289.0) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x / 289.0) * 289.0; }
vec4 permute(vec4 x) {
  x = mod289(x);
  vec4 r = x - floor(x / 17.0) * 17.0;
  // Equivalent lattice permutation with smaller intermediates on mobile GPUs.
  return mod289(34.0 * r * r + 10.0 * x);
}
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fadeCurve(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
float cnoise(vec3 P) {
  vec3 Pi0 = mod289(floor(P)), Pi1 = mod289(floor(P) + 1.0);
  vec3 Pf0 = fract(P), Pf1 = Pf0 - 1.0;
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x), iy = vec4(Pi0.yy, Pi1.yy);
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + Pi0.zzzz), ixy1 = permute(ixy + Pi1.zzzz);
  vec4 gx0 = ixy0 / 7.0, gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = 0.5 - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(vec4(0.0), gx0) - 0.5);
  gy0 -= sz0 * (step(vec4(0.0), gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0, gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = 0.5 - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(vec4(0.0), gx1) - 0.5);
  gy1 -= sz1 * (step(vec4(0.0), gy1) - 0.5);
  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x), g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z), g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x), g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z), g111 = vec3(gx1.w, gy1.w, gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0), n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z)), n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z)), n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz)), n111 = dot(g111, Pf1);
  vec3 f = fadeCurve(Pf0);
  vec4 nz = mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),f.z);
  vec2 ny = mix(nz.xy,nz.zw,f.y);
  return 2.2 * mix(ny.x,ny.y,f.x);
}
float fbm(vec3 p) { return (cnoise(p) + 0.5 * cnoise(p * 2.0)) / 1.5; }
float hash21(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float triangle(vec2 point, vec2 q) {
  vec2 p = vec2(abs(point.x), point.y);
  vec2 a = p - q * clamp(dot(p,q) / dot(q,q),0.0,1.0);
  vec2 b = p - q * vec2(clamp(p.x / q.x,0.0,1.0),1.0);
  float s = -sign(q.y);
  vec2 d = min(vec2(dot(a,a),s * (p.x*q.y-p.y*q.x)),vec2(dot(b,b),s*(p.y-q.y)));
  return -sqrt(d.x) * sign(d.y);
}
float shapeDistance(vec2 p, float shape, float size) {
  if (shape < 0.5) return max(abs(p.x),abs(p.y)) - size;
  if (shape < 1.5) return length(p) - size;
  return triangle(vec2(p.x,p.y+size),vec2(size,2.0*size));
}
void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec3 background = vec3(0.0431373,0.0627451,0.1254902);
  vec2 pixel = uv * uResolution, origin = vec2(0.0,uGrid.w);
  float cellPx = uGrid.z;
  vec2 cell = floor((pixel - origin) / cellPx);
  if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= uGrid.x || cell.y >= uGrid.y) {
    gl_FragColor = vec4(background,0.0); return;
  }
  vec2 center = origin + (cell + 0.5) * cellPx;
  vec2 local = (pixel - center) / (cellPx * 0.5), cellUv = center / uResolution;
  // The background stays in the viewport; the GIFT cutout scrolls with the hero.
  vec2 maskUv = vec2(cellUv.x,(center.y-uMaskPlacement.x)/uMaskPlacement.y);
  if (maskUv.y >= 0.0 && maskUv.y <= 1.0 && texture2D(uMask,maskUv).r > 0.5) {
    gl_FragColor = vec4(background,0.0); return;
  }
  vec2 q = abs(uv * 2.0 - 1.0);
  float radius = pow(pow(q.x,2.5)+pow(q.y,2.5),0.4) / pow(2.0,0.4);
  float level = 1.0 - smoothstep(0.45,1.0,radius);
  vec2 seed = vec2(12.9898,78.233);
  float noise = fbm(vec3(center / (32.0 * cellPx) + seed,uTime));
  float tone = clamp((noise * 0.5 + 0.5 - 0.54) * 2.8 + 0.5,0.0,1.0);
  float band = floor(min(tone,0.9999) * 3.0);
  float charge = texture2D(uCharges,(cell + 0.5) / uGrid.xy).r;
  float shape = 2.0 - mod(band + floor(min(charge,0.999) * 3.0),3.0);
  float size = 0.75, front = 0.0;
  if (uIntro < 1.66) {
    float radial = length((center-uResolution*0.5)/(uResolution*0.5))*0.70710678;
    float warp = cnoise(vec3(cellUv * vec2(3.2,2.4) + seed,4.7)) * 0.3;
    float spread = radial + warp + hash21(cell) * 0.16 + 0.3;
    float width = 0.2 * (0.6 + 0.8 * hash21(cell+vec2(17.0,9.0)));
    float t = clamp((uIntro-spread)/width,0.0,1.0);
    if (t <= 0.0) { gl_FragColor=vec4(background,0.0); return; }
    float back = t - 1.0;
    size = max(size*(1.0+2.70158*back*back*back+1.70158*back*back),0.02);
    front = 1.0-smoothstep(0.0,1.0,abs(uIntro-spread)/width);
  }
  float aa = 2.0 / cellPx;
  float coverage = 1.0-smoothstep(-aa,aa,shapeDistance(local,shape,size));
  vec3 tint = mix(vec3(0.572549),vec3(1.0),max(smoothstep(0.15,0.85,charge),front*0.35));
  vec3 rgb = mix(background,tint,coverage*level);
  float luminance = dot(tint*level,vec3(0.2126,0.7152,0.0722));
  float glow = max(0.0,(luminance-0.6)/0.4)*coverage;
  gl_FragColor = vec4(rgb,glow);
}
`;

const blurSource = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uSource;
uniform vec2 uStep;
uniform float uExtract;
void main() {
  vec3 total=vec3(0.0); float weights=0.0;
  for(int i=-6;i<=6;i++) {
    float d=float(i), w=exp(-d*d/8.0);
    vec4 value=texture2D(uSource,vUv+uStep*d);
    total+=value.rgb*mix(1.0,value.a,uExtract)*w; weights+=w;
  }
  gl_FragColor=vec4(total/weights,1.0);
}
`;
const compositeSource = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uScene;
uniform sampler2D uGlow;
void main() { gl_FragColor=vec4(texture2D(uScene,vUv).rgb+texture2D(uGlow,vUv).rgb*0.7,1.0); }
`;

export function createFlow(canvas, options = {}) {
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
  if(!gl) return null;
  const hero=document.querySelector('.hero'), surface=document.body;
  const maskCanvas=document.createElement('canvas'), maskContext=maskCanvas.getContext('2d');
  let scene,blur,composite,buffer,maskTexture,chargeTexture,targets=[],field;
  let width=1,height=1,frame=0,last=0,time=0,intro=options.paused?1.66:0;
  let paused=Boolean(options.paused),lost=false,destroyed=false;
  let heroTop=0,heroHeight=1,scrollFrame=0;
  const pointer={x:0,y:0,at:0,inside:false};
  function available(value) {
    canvas.parentElement.classList.toggle('is-ready',value);
    surface.classList.toggle('has-waves',value);
  }
  function compile(type,source) {
    const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) { const message=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error(message); }
    return shader;
  }
  function program(source,names) {
    const highp=gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT)?.precision>0;
    const vertex=compile(gl.VERTEX_SHADER,vertexSource),fragment=compile(gl.FRAGMENT_SHADER,highp?source:source.replace('highp','mediump'));
    const handle=gl.createProgram();gl.attachShader(handle,vertex);gl.attachShader(handle,fragment);gl.linkProgram(handle);
    gl.deleteShader(vertex);gl.deleteShader(fragment);
    if(!gl.getProgramParameter(handle,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(handle));
    return {handle,position:gl.getAttribLocation(handle,'aPosition'),uniforms:Object.fromEntries(names.map(name=>[name,gl.getUniformLocation(handle,name)]))};
  }
  function texture(filter=gl.NEAREST) {
    const result=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,result);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    return result;
  }
  function initialize() {
    scene=program(fragmentSource,['uResolution','uMaskPlacement','uGrid','uTime','uIntro','uMask','uCharges']);
    blur=program(blurSource,['uSource','uStep','uExtract']);composite=program(compositeSource,['uScene','uGlow']);
    buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
    maskTexture=texture();chargeTexture=texture();targets=[];
  }
  function bindTexture(value,unit) { gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,value); }
  function pass(shader,target=null) {
    gl.bindFramebuffer(gl.FRAMEBUFFER,target?.framebuffer??null);
    gl.viewport(0,0,target?.width??canvas.width,target?.height??canvas.height);
    gl.useProgram(shader.handle);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.enableVertexAttribArray(shader.position);gl.vertexAttribPointer(shader.position,2,gl.FLOAT,false,0,0);
  }
  function render() {
    if(lost||destroyed||!field) return;
    pass(scene,targets[0]);bindTexture(maskTexture,0);bindTexture(chargeTexture,1);
    const u=scene.uniforms;
    gl.uniform1i(u.uMask,0);gl.uniform1i(u.uCharges,1);gl.uniform2f(u.uResolution,width,height);
    gl.uniform2f(u.uMaskPlacement,heroTop,heroHeight);
    gl.uniform4f(u.uGrid,field.cols,field.rows,field.cell,field.originY);gl.uniform1f(u.uTime,time);gl.uniform1f(u.uIntro,intro);
    gl.drawArrays(gl.TRIANGLES,0,6);
    pass(blur,targets[1]);bindTexture(targets[0].texture,0);
    gl.uniform1i(blur.uniforms.uSource,0);gl.uniform2f(blur.uniforms.uStep,1/targets[1].width,0);gl.uniform1f(blur.uniforms.uExtract,1);
    gl.drawArrays(gl.TRIANGLES,0,6);
    pass(blur,targets[2]);bindTexture(targets[1].texture,0);
    gl.uniform2f(blur.uniforms.uStep,0,1/targets[2].height);gl.uniform1f(blur.uniforms.uExtract,0);gl.drawArrays(gl.TRIANGLES,0,6);
    pass(composite);bindTexture(targets[0].texture,0);bindTexture(targets[2].texture,1);
    gl.uniform1i(composite.uniforms.uScene,0);gl.uniform1i(composite.uniforms.uGlow,1);gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function drawMask() {
    if(lost||destroyed) return;
    const heroRect=hero?.getBoundingClientRect();
    heroTop=(heroRect?.top??0)-canvas.getBoundingClientRect().top;
    heroHeight=Math.max(1,heroRect?.height??height);
    const scale=Math.min(1,1024/Math.max(width,heroHeight));
    maskCanvas.width=Math.max(1,Math.round(width*scale));maskCanvas.height=Math.max(1,Math.round(heroHeight*scale));
    if(maskContext) {
      const mobile=width<=800,maskWidth=maskCanvas.width,maskHeight=maskCanvas.height;
      maskContext.fillStyle='#000';maskContext.fillRect(0,0,maskWidth,maskHeight);
      const maskFontFamily=getComputedStyle(document.documentElement).getPropertyValue('--display').trim()||'Poppins, sans-serif';
      let fontSize=Math.min(width*(mobile?0.3:0.19),heroHeight*0.33)*scale;
      maskContext.font=`700 ${fontSize}px ${maskFontFamily}`;
      const maxWidth=maskWidth*(mobile?0.83:0.40),measured=maskContext.measureText('GIFT').width;
      if(measured>maxWidth) {fontSize*=maxWidth/measured;maskContext.font=`700 ${fontSize}px ${maskFontFamily}`;}
      maskContext.textAlign='center';maskContext.textBaseline='middle';maskContext.fillStyle='#fff';
      maskContext.fillText('GIFT',maskWidth*(mobile?0.5:0.745),maskHeight*(mobile?0.72:0.48));
    }
    bindTexture(maskTexture,0);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,maskCanvas);
  }
  function allocateTargets() {
    for(const target of targets) {gl.deleteFramebuffer(target.framebuffer);gl.deleteTexture(target.texture);}
    targets=[];
    for(let i=0;i<3;i++) {
      const w=i===0?canvas.width:Math.max(1,Math.ceil(canvas.width/2));
      const h=i===0?canvas.height:Math.max(1,Math.ceil(canvas.height/2));
      const tex=texture(gl.LINEAR),framebuffer=gl.createFramebuffer();
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
      gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
      if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE) throw new Error('Wave rendering target unavailable');
      targets.push({texture:tex,framebuffer,width:w,height:h});
    }
  }
  function resize() {
    if(lost||destroyed) return;
    const rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    const mobile=width<=800,scale=Math.min(window.devicePixelRatio||1,1.5,Math.sqrt((mobile?850000:1800000)/(width*height)));
    canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
    const cols=Math.max(1,Math.round(width/10)),cell=width/cols,rows=Math.max(1,Math.floor(height/cell));
    field=new RippleField(cols,rows,cell,(height-rows*cell)/2);pointer.inside=false;
    bindTexture(chargeTexture,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,cols,rows,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,field.pixels);
    allocateTargets();drawMask();render();
  }
  function tick(now) {
    frame=0;if(paused||document.hidden||lost||destroyed) return;
    const elapsed=now-last;
    if(elapsed>=(width<=800?30:20)) {
      const dt=Math.min(elapsed/1000,0.05);last=now;time+=dt*0.1;intro=Math.min(1.66,intro+dt*1.66/1.6);
      if(field.step(dt)) {bindTexture(chargeTexture,1);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,field.cols,field.rows,gl.LUMINANCE,gl.UNSIGNED_BYTE,field.pixels);}
      render();
    }
    frame=requestAnimationFrame(tick);
  }
  function start() {if(!frame&&!paused&&!document.hidden&&!lost&&!destroyed){last=performance.now();frame=requestAnimationFrame(tick);}}
  function stop() {if(frame) cancelAnimationFrame(frame);if(scrollFrame)cancelAnimationFrame(scrollFrame);frame=0;scrollFrame=0;pointer.inside=false;}
  function leave() {pointer.inside=false;}
  function interact(event,click=false) {
    if(paused||document.hidden||lost||destroyed||event.target.closest?.('a,button,input,nav,dialog')) {leave();return;}
    if(click&&event.pointerType==='mouse'&&event.button!==0) return;
    const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top,now=performance.now();
    if(x<0||x>width||y<0||y>height) {leave();return;}
    const speed=pointer.inside?Math.hypot(x-pointer.x,y-pointer.y)/Math.max(8,now-pointer.at)*1000:0;
    field.splash(x,y,click?0.55:Math.min(1,0.22+speed*0.0006)*0.4);
    Object.assign(pointer,{x,y,at:now,inside:true});
  }
  function move(event) {interact(event);}
  function down(event) {interact(event,true);}
  function scroll() {
    if(lost||destroyed||document.hidden) return;
    heroTop=(hero?.getBoundingClientRect().top??0)-canvas.getBoundingClientRect().top;
    leave();
    // A paused pattern still moves its cutout with the document, with no simulation.
    if(paused&&!scrollFrame)scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;render();});
  }
  function visibility() {leave();if(document.hidden)stop();else{scroll();start();}}
  function contextLost(event) {event.preventDefault();lost=true;stop();available(false);}
  function contextRestored() {try{lost=false;initialize();resize();available(true);start();}catch{lost=true;available(false);}}
  initialize();resize();available(true);
  surface.addEventListener('pointermove',move,{passive:true});surface.addEventListener('pointerdown',down,{passive:true});
  surface.addEventListener('pointerleave',leave,{passive:true});surface.addEventListener('pointercancel',leave,{passive:true});
  window.addEventListener('scroll',scroll,{passive:true});
  document.addEventListener('visibilitychange',visibility);canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);
  const observer='ResizeObserver' in window?new ResizeObserver(resize):null;
  if(observer){observer.observe(canvas);if(hero)observer.observe(hero);}else window.addEventListener('resize',resize,{passive:true});
  document.fonts?.ready.then(()=>{if(!destroyed&&!lost){drawMask();render();}});
  start();
  return {
    setPaused(value){paused=Boolean(value);if(paused){stop();intro=1.66;render();}else start();},
    destroy(){
      stop();destroyed=true;available(false);observer?.disconnect();
      window.removeEventListener('resize',resize);window.removeEventListener('scroll',scroll);document.removeEventListener('visibilitychange',visibility);
      surface.removeEventListener('pointermove',move);surface.removeEventListener('pointerdown',down);surface.removeEventListener('pointerleave',leave);surface.removeEventListener('pointercancel',leave);
      canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);
      if(!lost){for(const target of targets){gl.deleteFramebuffer(target.framebuffer);gl.deleteTexture(target.texture);}gl.deleteTexture(maskTexture);gl.deleteTexture(chargeTexture);gl.deleteBuffer(buffer);for(const shader of [scene,blur,composite])gl.deleteProgram(shader.handle);}
    }
  };
}
