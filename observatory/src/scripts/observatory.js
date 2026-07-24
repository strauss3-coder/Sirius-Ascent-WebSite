/* The Observatory engine — ported verbatim from the approved Phase-1 prototype.
   Exposed as initObservatory() so Astro can (re)initialise it per page load. */
export function initObservatory(opts){
  var BASE=(opts&&opts.base)||"/";

  "use strict";
  var cv=document.getElementById("cosmos"),ctx=cv.getContext("2d");
  var reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
  var fine=matchMedia("(pointer:fine)").matches;
  var W,H,DPR,bg=null,layers=[],shooters=[];

  /* sections: star target (normalized, centre origin) + type */
  var SECS=[
    {id:"hero",     tx:0.00,ty:-0.16,ts:0.85,type:"hero"},
    {id:"portfolio",tx:0.00,ty:-0.02,ts:1.15,type:"constellation"},
    {id:"services", tx:0.00,ty:-0.02,ts:0.85,type:"orbit"},
    {id:"process",  tx:0.00,ty:-0.02,ts:0.80,type:"solar"},
    {id:"contact",  tx:0.00,ty:-0.05,ts:1.30,type:"beacon"}
  ];
  SECS.forEach(function(s){s.el=document.getElementById(s.id);s.heads=[].slice.call(s.el.querySelectorAll("[data-head]"));s.focus=0;});

  // Order = the order the star travels to them. Two live (custom-domain) first.
  // slug → the star flies into that case study (/work/<slug>).
  var PROJECTS=[
    {name:"Supreme Auto",tag:"α · risen",slug:"supreme-auto",nx:-0.26,ny:-0.16,mag:2.2,live:true},
    {name:"Venom Racing",tag:"β · risen",slug:"venom-racing",nx:0.25,ny:-0.19,mag:2.1,live:true},
    {name:"Riverside Padel",tag:"γ · plotted",slug:"riverside-padel",nx:0.39,ny:0.03,mag:1.5,live:false},
    {name:"Rhino's Pool Club",tag:"δ · plotted",slug:"rhinos-pool-club",nx:0.30,ny:0.21,mag:1.5,live:false},
    {name:"Xtreme Bikes",tag:"ε · plotted",slug:"xtreme-bikes",nx:0.08,ny:0.27,mag:1.4,live:false},
    {name:"Revline Panel Beating",tag:"ζ · plotted",slug:"revline-panel-beating",nx:-0.13,ny:0.24,mag:1.5,live:false},
    {name:"The View Lodge",tag:"η · plotted",slug:"the-view-lodge",nx:-0.31,ny:0.15,mag:1.5,live:false},
    {name:"Bankenveld",tag:"θ · plotted",slug:"bankenveld",nx:-0.40,ny:-0.03,mag:1.4,live:false},
    {name:"CrossFit Indefinite",tag:"ι · plotted",slug:"crossfit-indefinite",nx:-0.19,ny:-0.25,mag:1.4,live:false},
    {name:"Smallie's Car Wash",tag:"κ · plotted",slug:"smallies-car-wash",nx:0.07,ny:-0.29,mag:1.4,live:false}
  ];
  var SERVICES=[
    {name:"Web Design",ring:1,ang:0.3,sp:0.00016},
    {name:"Development",ring:2,ang:1.5,sp:-0.0001},
    {name:"SEO",ring:1,ang:3.2,sp:0.00016},
    {name:"Brand Identity",ring:3,ang:4.7,sp:0.00007},
    {name:"Care & Management",ring:2,ang:5.7,sp:-0.0001}
  ];
  var STAGES=["Discovery","Design","Build","Launch","Care"];

  function cx(){return W*0.5}function cy(){return H*0.46}
  function scl(){return Math.min(W,H)*(W<640?1.1:0.86)}

  function backdrop(){
    bg=document.createElement("canvas");bg.width=W;bg.height=H;var b=bg.getContext("2d");
    b.fillStyle="#08090c";b.fillRect(0,0,W,H);
    [[.78,.2,.6,"77,107,255",.12],[.2,.7,.7,"90,70,180",.09],[.5,.35,.9,"40,60,150",.06],[.9,.8,.5,"77,107,255",.05]].forEach(function(o){
      var g=b.createRadialGradient(o[0]*W,o[1]*H,0,o[0]*W,o[1]*H,o[2]*Math.max(W,H));
      g.addColorStop(0,"rgba("+o[3]+","+o[4]+")");g.addColorStop(1,"rgba("+o[3]+",0)");b.fillStyle=g;b.fillRect(0,0,W,H);
    });
    var hy=H*1.02,rad=W*1.4,hg=b.createRadialGradient(cx(),hy,rad*.6,cx(),hy,rad);
    hg.addColorStop(0,"rgba(77,107,255,.12)");hg.addColorStop(1,"rgba(77,107,255,0)");b.fillStyle=hg;b.fillRect(0,0,W,H);
    var vg=b.createRadialGradient(cx(),cy(),Math.min(W,H)*.3,cx(),cy(),Math.max(W,H)*.85);
    vg.addColorStop(0,"rgba(8,9,12,0)");vg.addColorStop(1,"rgba(4,4,7,.85)");b.fillStyle=vg;b.fillRect(0,0,W,H);
  }
  function resize(){
    DPR=Math.min(devicePixelRatio||1,2);W=cv.width=innerWidth*DPR;H=cv.height=innerHeight*DPR;
    cv.style.width=innerWidth+"px";cv.style.height=innerHeight+"px";
    var defs=[[Math.min(150,(W*H/9000)|0),.2,.8,.15,0,.15,.5],[Math.min(80,(W*H/20000)|0),.5,1.3,.4,0,.25,.7],[Math.min(22,(W*H/70000)|0),1.4,2.8,.85,6,.2,.55]];
    layers=defs.map(function(d){var a=[];for(var i=0;i<d[0];i++)a.push({x:Math.random()*W,y:Math.random()*H,r:(Math.random()*(d[2]-d[1])+d[1])*DPR,b:Math.random()*(d[6]-d[5])+d[5],tw:Math.random()*6.28,sp:Math.random()*.9+.3,blue:Math.random()>.85});return{arr:a,depth:d[3],blur:d[4]};});
    backdrop();
    SECS.forEach(function(s){s.top=s.el.offsetTop;s.h=s.el.offsetHeight;});
  }

  var dot=document.querySelector(".cur-dot"),ring=document.querySelector(".cur-ring");
  var px=innerWidth/2,py=innerHeight/2,rx=px,ry=py,hoverName=null,hoverLive=false,hoverX=0,hoverY=0,clickTargets=[];
  if(fine){document.body.classList.add("has-cursor");addEventListener("pointermove",function(e){px=e.clientX;py=e.clientY;},{passive:true});}
  var magEls=[].slice.call(document.querySelectorAll("[data-mag]")),magS=magEls.map(function(){return{x:0,y:0,tx:0,ty:0}});
  if(fine&&!reduce)addEventListener("pointermove",function(e){magEls.forEach(function(el,i){var r=el.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);if(Math.hypot(dx,dy)<80){magS[i].tx=dx*.28;magS[i].ty=dy*.28;}else{magS[i].tx=0;magS[i].ty=0;}});},{passive:true});

  // click a live star to visit it
  // click a project star to fly INTO its case study (same tab, internal nav)
  addEventListener("click",function(e){
    if(e.target.closest("a,button,input,textarea")) return;
    for(var i=0;i<clickTargets.length;i++){var c=clickTargets[i];if(c.href&&Math.hypot(e.clientX-c.x,e.clientY-c.y)<26){location.href=c.href;return;}}
  });

  var nextShoot=6000+Math.random()*8000;
  function spawnShoot(){var sx=Math.random()*W*.7+W*.15,sy=Math.random()*H*.4,ang=Math.PI*(.15+Math.random()*.2);shooters.push({x:sx,y:sy,vx:Math.cos(ang)*(14+Math.random()*8)*DPR,vy:Math.sin(ang)*(14+Math.random()*8)*DPR,life:1,len:120+Math.random()*120});}

  /* opt-in audio */
  var audio=null;
  document.getElementById("snd").addEventListener("click",function(){
    var btn=this;
    if(!audio){try{
      var AC=window.AudioContext||window.webkitAudioContext,ac=new AC();
      var master=ac.createGain();master.gain.value=0;master.connect(ac.destination);
      var lp=ac.createBiquadFilter();lp.type="lowpass";lp.frequency.value=520;lp.connect(master);
      var o1=ac.createOscillator();o1.type="sine";o1.frequency.value=55;
      var o2=ac.createOscillator();o2.type="sine";o2.frequency.value=55.4;
      var o3=ac.createOscillator();o3.type="sine";o3.frequency.value=110.2;var g3=ac.createGain();g3.gain.value=.25;o3.connect(g3);g3.connect(lp);
      o1.connect(lp);o2.connect(lp);
      var lfo=ac.createOscillator();lfo.frequency.value=.05;var lg=ac.createGain();lg.gain.value=180;lfo.connect(lg);lg.connect(lp.frequency);
      o1.start();o2.start();o3.start();lfo.start();
      master.gain.linearRampToValueAtTime(.09,ac.currentTime+2.5);
      (function blip(){if(!audio||!audio.on)return;var t=ac.currentTime,os=ac.createOscillator(),gg=ac.createGain();os.type="sine";os.frequency.setValueAtTime(1400+Math.random()*700,t);gg.gain.setValueAtTime(0,t);gg.gain.linearRampToValueAtTime(.03,t+.02);gg.gain.exponentialRampToValueAtTime(.0001,t+.25);os.connect(gg);gg.connect(master);os.start(t);os.stop(t+.3);setTimeout(blip,8000+Math.random()*16000);})();
      audio={ac:ac,master:master,on:true};
    }catch(e){return;}}
    else{audio.on=!audio.on;audio.master.gain.linearRampToValueAtTime(audio.on?.09:0,audio.ac.currentTime+.6);}
    btn.classList.toggle("on",audio.on);btn.setAttribute("aria-pressed",audio.on?"true":"false");btn.lastChild.nodeValue=audio.on?" Sound On":" Sound Off";
  });

  document.getElementById("cform").addEventListener("submit",function(e){e.preventDefault();this.classList.add("sent");});

  var START=performance.now(),smoothScroll=window.scrollY||0,starX=null,starY=null,starS=null;
  var revealed=false,hudIn=false;
  var boot=document.querySelector(".boot"),bootText=document.getElementById("bootText"),hud=document.getElementById("hud"),hero=document.getElementById("hero");
  var legend=document.getElementById("legend"),prog=document.getElementById("prog"),progDots=[].slice.call(prog.querySelectorAll("a"));
  var portfolioCount=document.getElementById("portfolioCount");
  var ease=function(t){return 1-Math.pow(1-t,3)},c01=function(t){return t<0?0:t>1?1:t};
  var smooth=function(t){t=c01(t);return t*t*(3-2*t)};

  function gstar(x,y,r,glow,core){if(glow>.01){var g=ctx.createRadialGradient(x,y,0,x,y,r*15*glow);g.addColorStop(0,"rgba(234,240,255,"+(.5*glow)+")");g.addColorStop(.2,"rgba(125,148,255,"+(.3*glow)+")");g.addColorStop(1,"rgba(77,107,255,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*15*glow,0,7);ctx.fill();}ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle=core;ctx.fill();}
  /* Sirius: layered bloom with soft falloff so it always reads, never overpowers */
  function drawSirius(x,y,r,b){
    var h1=ctx.createRadialGradient(x,y,0,x,y,r*22);
    h1.addColorStop(0,"rgba(150,178,255,"+(.34*b)+")");h1.addColorStop(.3,"rgba(100,128,255,"+(.12*b)+")");h1.addColorStop(1,"rgba(77,107,255,0)");
    ctx.fillStyle=h1;ctx.beginPath();ctx.arc(x,y,r*22,0,7);ctx.fill();
    var h2=ctx.createRadialGradient(x,y,0,x,y,r*6.5);
    h2.addColorStop(0,"rgba(255,255,255,"+(.82*b)+")");h2.addColorStop(.38,"rgba(224,234,255,"+(.4*b)+")");h2.addColorStop(1,"rgba(160,185,255,0)");
    ctx.fillStyle=h2;ctx.beginPath();ctx.arc(x,y,r*6.5,0,7);ctx.fill();
    ctx.fillStyle="rgba(255,255,255,"+Math.min(1,b)+")";ctx.beginPath();ctx.arc(x,y,r*1.1,0,7);ctx.fill();
  }
  function label(txt,sub,lx,ly,live){ctx.font=(13*DPR)+"px ui-monospace,'SF Mono',Menlo,monospace";ctx.textBaseline="middle";ctx.fillStyle="rgba(234,240,255,.97)";ctx.fillText(txt.toUpperCase(),lx+16*DPR,ly-(sub?4*DPR:0));if(sub){ctx.font=(9.5*DPR)+"px ui-monospace,'SF Mono',Menlo,monospace";ctx.fillStyle=live?"rgba(111,240,192,.95)":"rgba(125,148,255,.95)";ctx.fillText(sub.toUpperCase(),lx+16*DPR,ly+11*DPR);}ctx.strokeStyle="rgba(125,148,255,.55)";ctx.lineWidth=1*DPR;ctx.beginPath();ctx.moveTo(lx+7*DPR,ly);ctx.lineTo(lx+13*DPR,ly);ctx.stroke();}

  function frame(now){
    var t=now-START,vpMid=innerHeight/2;
    // inertial scroll: the world carries momentum and eases into place (mass)
    var realSc=window.scrollY||0;
    smoothScroll+=reduce?(realSc-smoothScroll):(realSc-smoothScroll)*0.075;
    // focus per section, computed from the SMOOTHED scroll so docks ease in with weight
    var sum=0,star={x:0,y:0,s:0},active=0,amax=0,darken=0;
    SECS.forEach(function(s,i){
      var mid=s.top+s.h/2-smoothScroll;
      var f=1-c01(Math.abs(mid-vpMid)/(innerHeight*0.62));s.focus=f;
      var w=f*f;sum+=w;star.x+=s.tx*w;star.y+=s.ty*w;star.s+=s.ts*w;
      if(f>amax){amax=f;active=i;}
      if(s.type!=="hero")darken=Math.max(darken,f);
    });
    if(sum<1e-4)sum=1e-4;
    star.x/=sum;star.y/=sum;star.s/=sum;

    // update DOM heads + progress
    SECS.forEach(function(s,i){
      var o=smooth((s.focus-0.35)/0.5);
      s.heads.forEach(function(h){h.style.opacity=o;h.style.transform="translateY("+((1-o)*20)+"px)";});
      progDots[i].classList.toggle("on",i===active);
    });
    document.querySelectorAll(".nav a").forEach(function(a){a.classList.toggle("active",a.getAttribute("href")==="#"+SECS[active].id);});

    var camY=Math.min(smoothScroll,innerHeight)*0.25*DPR;
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);
    if(bg)ctx.drawImage(bg,0,-camY*0.3);
    var ntx=(px/innerWidth-.5)*2,nty=(py/innerHeight-.5)*2;
    var fieldA=reduce?1:ease(c01((t-700)/2200));

    // ambient layers
    ctx.globalCompositeOperation="lighter";
    for(var li=0;li<layers.length;li++){var L=layers[li];if(L.blur){ctx.shadowBlur=L.blur*DPR;ctx.shadowColor="rgba(180,200,255,.9)";}else ctx.shadowBlur=0;
      var ox=ntx*L.depth*16*DPR,oy=nty*L.depth*16*DPR-camY*L.depth;
      for(var si=0;si<L.arr.length;si++){var s2=L.arr[si];var a=(reduce?s2.b:s2.b+Math.sin(t*.001*s2.sp+s2.tw)*.28)*fieldA;if(a<=0)continue;var yy=((s2.y+oy)%H+H)%H;ctx.beginPath();ctx.arc(s2.x+ox,yy,s2.r,0,7);ctx.fillStyle=s2.blue?"rgba(125,148,255,"+a+")":"rgba(228,232,238,"+(a*.9)+")";ctx.fill();}}
    ctx.shadowBlur=0;
    // shooters (only when not docked)
    if(!reduce&&darken<0.25){if(t>3600&&(nextShoot-=16)<=0){spawnShoot();nextShoot=22000+Math.random()*22000;}}
    for(var shi=shooters.length-1;shi>=0;shi--){var sh=shooters[shi];sh.x+=sh.vx;sh.y+=sh.vy;sh.life-=.012;if(sh.life<=0){shooters.splice(shi,1);continue;}var hl=Math.hypot(sh.vx,sh.vy),tx2=sh.x-sh.vx/hl*sh.len*DPR,ty2=sh.y-sh.vy/hl*sh.len*DPR;var gg=ctx.createLinearGradient(sh.x,sh.y,tx2,ty2);gg.addColorStop(0,"rgba(234,240,255,"+(.9*sh.life)+")");gg.addColorStop(1,"rgba(234,240,255,0)");ctx.strokeStyle=gg;ctx.lineWidth=1.4*DPR;ctx.beginPath();ctx.moveTo(sh.x,sh.y);ctx.lineTo(tx2,ty2);ctx.stroke();}
    ctx.globalCompositeOperation="source-over";

    // darken veil for docks
    if(darken>0.01){ctx.fillStyle="rgba(5,6,10,"+(darken*0.55)+")";ctx.fillRect(0,0,W,H);}

    // ---- persistent Sirius position ----
    // one continuous star: intro rise, scroll travel and docking are the SAME eased motion.
    // Organic drift + parallax keep it alive between interactions; the lerp gives it weight.
    var wander=reduce?0:Math.sin(smoothScroll*0.0008+t*0.00018)*0.012;
    var driftX=reduce?0:(Math.sin(t*0.0003)*6+Math.sin(t*0.00017)*4)*DPR;
    var driftY=reduce?0:(Math.cos(t*0.00023)*5+Math.sin(t*0.00011)*3)*DPR;
    var tX=cx()+(star.x+wander)*scl()+ntx*12*DPR+driftX;
    var tY=cy()+star.y*scl()+nty*12*DPR-camY*0.15+driftY;
    var tS=star.s;
    if(starX===null){starX=tX;starY=reduce?tY:H*1.35;starS=tS*(reduce?1:0.55);}
    var k=reduce?1:0.04;
    starX+=(tX-starX)*k;starY+=(tY-starY)*k;starS+=(tS-starS)*k;
    var sirX=starX,sirY=starY,sirScale=starS;
    clickTargets=[];hoverName=null;hoverHref=null;
    var showAll=!fine;bodyLabels.length=0; // touch has no hover, so name every body

    // ================= SET-PIECES =================
    var A=amax; // active section focus strength
    var sec=SECS[active];
    ctx.globalCompositeOperation="lighter";

    if(sec.type==="constellation"&&A>0.02){
      var R=scl();
      // Travel: the star reaches out to each project in turn as you scroll THROUGH
      // the (tall) portfolio section. Cinematic but free — never locks the scroll.
      var travelP=c01((smoothScroll - sec.top + innerHeight*0.5)/Math.max(1,sec.h - innerHeight*0.55));
      var activeF=travelP*PROJECTS.length;
      var curIdx=Math.max(0,Math.min(PROJECTS.length-1,Math.round(activeF-0.5)));
      for(var pj=0;pj<PROJECTS.length;pj++){
        var pp=PROJECTS[pj],sx3=sirX+pp.nx*R,sy3=sirY+pp.ny*R;
        var rev=c01(activeF-pj); if(rev<=0.002)continue; // sequential reveal
        // connecting line reaches out from Sirius toward the project
        ctx.strokeStyle="rgba(125,148,255,"+(0.2*A*rev)+")";ctx.lineWidth=1*DPR;
        ctx.beginPath();ctx.moveTo(sirX,sirY);ctx.lineTo(sirX+(sx3-sirX)*Math.min(1,rev/0.6),sirY+(sy3-sirY)*Math.min(1,rev/0.6));ctx.stroke();
        if(rev<0.55)continue; // star arrives once the line reaches it
        var isCur=(pj===curIdx);
        var scr={x:sx3/DPR,y:sy3/DPR};
        var hov=fine&&Math.hypot(px-scr.x,py-scr.y)<26;
        var href=BASE+"work/"+pp.slug;
        if(hov){hoverName=pp.name;hoverLive=pp.live;hoverX=sx3;hoverY=sy3;hoverSub=pp.tag;hoverHref=href;}
        clickTargets.push({x:scr.x,y:scr.y,href:href});
        if(showAll||isCur)bodyLabels.push({x:sx3,y:sy3,name:pp.name,live:pp.live});
        var rr=pp.mag*DPR*(hov||isCur?1.55:1);
        var em=(hov||isCur?1.7:1)*rev;
        gstar(sx3,sy3,rr,(pp.live?.75:.45)*A*em,pp.live?"rgba(234,240,255,"+(A*rev)+")":"rgba(205,216,242,"+(A*rev*.9)+")");
      }
      if(portfolioCount){var shown=Math.min(PROJECTS.length,Math.floor(activeF)+1);portfolioCount.textContent=(shown<10?"0"+shown:""+shown)+" / "+(PROJECTS.length<10?"0"+PROJECTS.length:PROJECTS.length);}
    }
    else if(sec.type==="orbit"&&A>0.02){
      var baseR=Math.min(W,H)*0.13;
      for(var rr2=1;rr2<=3;rr2++){ctx.strokeStyle="rgba(125,148,255,"+(0.10*A)+")";ctx.lineWidth=1*DPR;ctx.beginPath();ctx.arc(sirX,sirY,baseR*rr2,0,7);ctx.stroke();}
      for(var vi=0;vi<SERVICES.length;vi++){var v=SERVICES[vi];var ang=v.ang+(reduce?0:t*v.sp);var ox2=sirX+Math.cos(ang)*baseR*v.ring,oy2=sirY+Math.sin(ang)*baseR*v.ring;
        var scr2={x:ox2/DPR,y:oy2/DPR};var hov2=fine&&Math.hypot(px-scr2.x,py-scr2.y)<24;
        if(hov2){hoverName=v.name;hoverLive=true;hoverX=ox2;hoverY=oy2;hoverSub=null;}
        if(showAll)bodyLabels.push({x:ox2,y:oy2,name:v.name,live:true});
        gstar(ox2,oy2,(hov2?4:2.6)*DPR,0.7*A*(hov2?1.5:1),"rgba(234,240,255,"+A+")");
      }
    }
    else if(sec.type==="solar"&&A>0.02){
      var stepR=Math.min(W,H)*0.075;
      for(var gi=0;gi<STAGES.length;gi++){var orad=stepR*(gi+1.4);
        ctx.strokeStyle="rgba(125,148,255,"+(0.09*A)+")";ctx.lineWidth=1*DPR;ctx.beginPath();ctx.arc(sirX,sirY,orad,0,7);ctx.stroke();
        var ga=(reduce?0:t*0.00008)+gi*1.25;var gx=sirX+Math.cos(ga)*orad,gy=sirY+Math.sin(ga)*orad;
        var scr3={x:gx/DPR,y:gy/DPR};var hov3=fine&&Math.hypot(px-scr3.x,py-scr3.y)<24;
        gstar(gx,gy,(hov3?4:3)*DPR,0.7*A*(hov3?1.5:1),"rgba(234,240,255,"+A+")");
        // stage number + name, drawn source-over below
        stageLabels.push({x:gx,y:gy,n:gi+1,name:STAGES[gi],hov:hov3});
      }
    }
    else if(sec.type==="beacon"&&A>0.02){
      for(var bi=0;bi<3;bi++){var ph=((t*0.0004+bi/3)%1);var pr=ph*Math.min(W,H)*0.4;ctx.strokeStyle="rgba(125,148,255,"+(0.35*A*(1-ph))+")";ctx.lineWidth=1.4*DPR;ctx.beginPath();ctx.arc(sirX,sirY,pr,0,7);ctx.stroke();}
    }

    // Sirius itself (the guide) — the first light in, always readable, never overpowering
    var beaconBoost=sec.type==="beacon"?(1+A*0.7):1;
    var twinkle=reduce?1:1+Math.sin(t*0.0013)*0.09;
    var sirBright=(reduce?1:ease(c01((t-200)/1500)))*twinkle*beaconBoost;
    // recede behind docked content so section text always reads over the star
    if(sec.type!=="beacon")sirBright*=(1-darken*0.34);
    var pulse=reduce?1:1+Math.sin(t*.0016)*.12;
    var sr=Math.max(2.7*DPR,3.2*DPR*sirScale)*beaconBoost;
    var sp=34*DPR*pulse*Math.max(0.92,sirScale);
    ctx.strokeStyle="rgba(234,240,255,"+(.34*sirBright)+")";ctx.lineWidth=1*DPR;
    ctx.beginPath();ctx.moveTo(sirX-sp,sirY);ctx.lineTo(sirX+sp,sirY);ctx.moveTo(sirX,sirY-sp);ctx.lineTo(sirX,sirY+sp);ctx.stroke();
    var lf=ctx.createLinearGradient(sirX-sp*2.6,sirY,sirX+sp*2.6,sirY);lf.addColorStop(0,"rgba(125,148,255,0)");lf.addColorStop(.5,"rgba(202,216,255,"+(.32*sirBright)+")");lf.addColorStop(1,"rgba(125,148,255,0)");
    ctx.strokeStyle=lf;ctx.beginPath();ctx.moveTo(sirX-sp*2.6,sirY);ctx.lineTo(sirX+sp*2.6,sirY);ctx.stroke();
    drawSirius(sirX,sirY,sr,sirBright);
    ctx.globalCompositeOperation="source-over";

    // labels (source-over so text is crisp)
    if(sec.type==="solar"&&A>0.3){for(var sl=0;sl<stageLabels.length;sl++){var S=stageLabels[sl];ctx.font=(10*DPR)+"px ui-monospace,'SF Mono',Menlo,monospace";ctx.textBaseline="middle";ctx.fillStyle="rgba(125,148,255,"+A+")";ctx.fillText("0"+S.n,S.x/DPR*DPR+10*DPR,S.y-8*DPR);ctx.fillStyle="rgba(234,240,255,"+(A*.95)+")";ctx.fillText(S.name.toUpperCase(),S.x+10*DPR,S.y+6*DPR);}}
    stageLabels.length=0;
    // persistent body labels (mobile): name each project/service beside its star
    if(bodyLabels.length&&A>0.3){ctx.textBaseline="middle";
      for(var bl2=0;bl2<bodyLabels.length;bl2++){var B=bodyLabels[bl2];var left=B.x<sirX;
        ctx.textAlign=left?"right":"left";ctx.font=(9.5*DPR)+"px ui-monospace,'SF Mono',Menlo,monospace";
        ctx.fillStyle=(B.live?"rgba(234,240,255,":"rgba(205,216,242,")+(A*0.92)+")";
        ctx.fillText(B.name.toUpperCase(),B.x+(left?-9*DPR:9*DPR),B.y);}
      ctx.textAlign="left";}
    if(hoverName)label(hoverName,hoverSub,hoverX/DPR*DPR,hoverY,hoverLive);

    // cursor + magnetism
    if(fine){
      var tgx=px,tgy=py,magnet=false,best=90,ni=-1;
      // magnet to nearest set-piece body when a section is docked
      for(var ci=0;ci<clickTargets.length;ci++){var c=clickTargets[ci],d=Math.hypot(px-c.x,py-c.y);if(d<best){best=d;ni=ci;tgx=c.x;tgy=c.y;}}
      if(ni>-1&&!reduce&&A>0.4){magnet=true;}else{tgx=px;tgy=py;}
      rx+=(tgx-rx)*.18;ry+=(tgy-ry)*.18;
      dot.style.transform="translate3d("+px+"px,"+py+"px,0)";
      ring.style.transform="translate3d("+rx+"px,"+ry+"px,0)";
      ring.classList.toggle("mag",magnet||!!hoverName);
      ring.style.cursor=hoverHref?"pointer":"";
      magEls.forEach(function(el,i){var m=magS[i];m.x+=(m.tx-m.x)*.15;m.y+=(m.ty-m.y)*.15;el.style.transform="translate("+m.x.toFixed(2)+"px,"+m.y.toFixed(2)+"px)";});
    }

    // boot + reveal
    if(!reduce)bootText.textContent=t<1600?"CALIBRATING SKY":t<3400?"ENTERING ORBIT":"";
    if(t>3000&&!revealed){revealed=true;hero.classList.add("revealed");}
    if(t>3900&&!hudIn){hudIn=true;hud.classList.add("in");boot.classList.add("gone");prog.classList.add("show");}
    legend.classList.toggle("show",SECS[1].focus>0.4);

    requestAnimationFrame(frame);
  }
  var stageLabels=[],bodyLabels=[],hoverSub=null,hoverHref=null;

  addEventListener("resize",resize,{passive:true});
  resize();
  if(reduce){hero.classList.add("revealed");hud.classList.add("in");boot.classList.add("gone");prog.classList.add("show");}
  requestAnimationFrame(frame);

}
