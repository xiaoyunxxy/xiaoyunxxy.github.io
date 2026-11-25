(() => {
  'use strict';
  const map = document.getElementById('town-map');
  if (!map) return;
  const modules = [
    {id: 'about-me', title: 'About Me', place: 'The courtyard house', x: 210, y: 110, kind: 'house', scale: .96, lot: [65,28,280,174,'#a9bd70'], label: [551,136]},
    {id: 'services', title: 'Services', place: 'The Dutch windmill', x: 635, y: 106, kind: 'windmill', scale: .98, rise: 64, lot: [534,22,231,191,'#a4b968'], label: [823,182]},
    {id: 'publications', title: 'Publications', place: 'Huygens Building - Radboud University', x: 303, y: 540, kind: 'huygens', scale: 1.5, lot: [26,337,382,399,'#a1b973'], label: [397,345]},
    {id: 'educations', title: 'Education', place: 'Erasmus Building - Radboud University', x: 955, y: 90, kind: 'erasmus', scale: 1.05, rise: 230, lot: [886,20,189,194,'#a6bf73'], label: [1030,113]},
    {id: 'news', title: 'News', place: 'The shopping arcade', x: 637, y: 441, kind: 'mall', scale: 1.02, lot: [530,340,234,204,'#a6bb74'], label: [610,341]},
    {id: 'miscellaneous', title: 'Miscellaneous', place: 'The seaside campsite', x: 987, y: 689, kind: 'camp', scale: .8, lot: [887,651,188,87,'#8fae50'], label: [735,552]},
    {id: 'cv', title: 'CV', place: 'The post office', x: 982, y: 452, kind: 'post', scale: .82, lot: [901,365,173,174,'#a5bd71'], label: [843,461]}
  ];
  const content = document.querySelector('#main .page__content');
  const dialog = document.getElementById('town-dialog');
  const panel = document.getElementById('town-dialog-content');
  // Keep the dialog outside the source content so copied modules cannot include it.
  document.body.append(dialog);
  const sections = new Map();
  for (const m of modules) {
    const heading = [...content.querySelectorAll('h1')].find(h => h.id === m.id);
    const nodes = [];
    if (heading) {
      for (let n = heading.nextSibling; n; n = n.nextSibling) {
        if (n.nodeType === 1 && (n.tagName === 'H1' || n.id === 'town' || n.classList.contains('town-source'))) break;
        if (n.nodeType === 1 && ['LINK', 'SCRIPT'].includes(n.tagName)) continue;
        nodes.push(n);
      }
    }
    sections.set(m.id, nodes);
  }
  // Add the homepage-only control after collecting the full modal content.
  const newsList=content.querySelector('#news + ul');
  if(newsList && newsList.children.length>3) {
    newsList.id='news-preview-list';
    newsList.classList.add('news-preview');
    const toggle=document.createElement('button');
    toggle.type='button';
    toggle.className='news-toggle';
    toggle.setAttribute('aria-controls',newsList.id);
    toggle.setAttribute('aria-expanded','false');
    toggle.innerHTML='<span>Show more</span><i class="fa fa-angle-down" aria-hidden="true"></i>';
    toggle.addEventListener('click',()=>{
      const expanded=newsList.classList.toggle('is-expanded');
      toggle.setAttribute('aria-expanded',String(expanded));
      toggle.querySelector('span').textContent=expanded?'Show less':'Show more';
      toggle.querySelector('i').className='fa '+(expanded?'fa-angle-up':'fa-angle-down');
    });
    newsList.after(toggle);
  }
  const polygon = (points, color) => `<polygon points="${points}" fill="${color}"/>`;
  const point = (x, y, z = 0) => [130 + x * .8 - y * .62, 146 + x * .30 + y * .34 - z];
  const face = (coords, color) => polygon(coords.map(p => point(...p).join(',')).join(' '), color);
  function block(x, y, w, d, h, colors = ['#fff1d8', '#d7bfa0', '#f4dfb7'], z = 0) {
    return face([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],colors[0]) +
      face([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],colors[1]) +
      face([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],colors[2]);
  }
  function windowPane(x, y, z, w = 15, h = 22, color = '#83b3d1') {
    return face([[x,y,z],[x+w,y,z],[x+w,y,z+h],[x,y,z+h]],color) +
      face([[x+2,y+.2,z+h-3],[x+w-2,y+.2,z+h-3],[x+w-2,y+.2,z+h-5],[x+2,y+.2,z+h-5]],'#d8eef8');
  }
  function roof(x, y, w, d, h, rise = 30, colors = ['#cf8356','#935a3c','#b86d46']) {
    return face([[x-6,y-5,h],[x+w/2,y-5,h+rise],[x+w/2,y+d+5,h+rise],[x-6,y+d+5,h]],colors[0]) +
      face([[x+w/2,y-5,h+rise],[x+w+6,y-5,h],[x+w+6,y+d+5,h],[x+w/2,y+d+5,h+rise]],colors[1]) +
      face([[x-6,y+d+5,h],[x+w+6,y+d+5,h],[x+w/2,y+d+5,h+rise]],colors[2]);
  }
  function sign(text, x, y, z, size = 9, color = '#2a567d') {
    const [sx,sy] = point(x,y,z);
    return `<text x="${sx}" y="${sy}" fill="${color}" font-family="Arial,sans-serif" font-weight="700" font-size="${size}" transform="rotate(20 ${sx} ${sy})">${text}</text>`;
  }
  function tree(x,y,scale=1) {
    return `<g class="obj-tree" transform="translate(${x} ${y}) scale(${scale})"><ellipse cy="4" rx="17" ry="7" fill="#557138" opacity=".2"/><path d="M0 0v-35" stroke="#8f744b" stroke-width="5"/><ellipse cy="-38" rx="19" ry="29" fill="#88ad49"/><path d="M0-67a19 29 0 0 1 0 58" fill="#70923d"/><ellipse cx="-6" cy="-47" rx="5" ry="9" fill="#a6c563"/></g>`;
  }
  function building(kind,rise=0) {
    let art = '';
    if (kind === 'house') {
      art += block(-100,-74,192,153,4,['#8ca75b','#718b4b','#a4bf69']);
      art += block(-20,18,26,60,2,['#d5dbd9','#d5dbd9','#edf0ed']);
      art += block(-72,-56,97,78,57,['#b9d3b1','#83ab8d','#e6e9c5']);
      art += windowPane(-62,23,23,19,22) + windowPane(-6,23,23,19,22) + windowPane(-35,23,0,18,34,'#48749b');
      art += roof(-72,-56,97,78,57,31);
      art += block(-56,-36,12,13,34,['#b9c8d4','#9cafbf','#d6e0e7'],57);
      art += block(40,20,39,25,9,['#a38550','#886d3f','#bed778']);
      for (let x=45;x<75;x+=9) {const p=point(x,28,18);art+=`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#f8d75e"/><circle cx="${p[0]}" cy="${p[1]}" r="1.5" fill="#8b603b"/>`;}
      for(let x=-95;x<95;x+=14) art+=block(x,78,4,4,18,['#fff','#c5d4da','#fff']);
      art+=block(-96,78,67,3,4,['#f9fcff','#f9fcff','#f9fcff'],10)+block(5,78,92,3,4,['#f9fcff','#f9fcff','#f9fcff'],10);
      art+=tree(222,151,.72);
    } else if (kind === 'windmill') {
      art+=block(-64,-61,128,126,4,['#abb68c','#91a17c','#c3cd9e']);
      const tail=[point(0,-20,110),point(0,-76,12)];
      art+=`<path d="M${tail[0]}L${tail[1]}" fill="none" stroke="#586551" stroke-width="4"/>`;
      const footprint=[[-45,-25],[-25,-45],[25,-45],[45,-25],[45,25],[25,45],[-25,45],[-45,25]];
      const wallPoint=(p,z)=>[p[0]*(1-(z-4)/235),p[1]*(1-(z-4)/235),z];
      for(let i=0;i<footprint.length;i++) {
        const a=footprint[i],b=footprint[(i+1)%footprint.length];
        if((a[0]+b[0])*.775+a[1]+b[1]<0) continue;
        art+=face([wallPoint(a,4),wallPoint(b,4),wallPoint(b,110),wallPoint(a,110)],['#95805b','#95805b','#927952','#8d734f','#ad9365','#c1aa7d','#cbb98b','#a38b62'][i]);
        for(let z=16;z<108;z+=7) art+=face([wallPoint(a,z),wallPoint(b,z),wallPoint(b,z+.65),wallPoint(a,z+.65)],'#96825b');
      }
      const frontY=z=>45*(1-(z-4)/235);
      art+=face([[-10,frontY(4),4],[10,frontY(4),4],[10,frontY(30),30],[-10,frontY(30),30]],'#325b4c');
      for(const z of [46,78]) {
        art+=face([[-8,frontY(z),z],[8,frontY(z),z],[8,frontY(z+13),z+13],[-8,frontY(z+13),z+13]],'#ecead7');
        art+=face([[-5,frontY(z+2)+.1,z+2],[5,frontY(z+2)+.1,z+2],[5,frontY(z+11)+.1,z+11],[-5,frontY(z+11)+.1,z+11]],'#628788');
      }
      for(let i=0;i<footprint.length;i++) {
        const a=footprint[i].map(v=>v*.68),b=footprint[(i+1)%footprint.length].map(v=>v*.68);
        art+=face([[...a,109],[...b,109],[0,-4,138]],['#647265','#647265','#536052','#3f5149','#4b6052','#617362','#71806b','#6a7763'][i]);
      }
      const hub=point(0,32,116);
      let sails='';
      for(const angle of [0,90,180,270]) {
        let sail='<path d="M0 5V-87" fill="none" stroke="#4c5145" stroke-width="3.5"/><path d="M2-82H20V-28H2Z" fill="#f2e9ce" stroke="#69705a" stroke-width="1.3"/><path d="M11-82v54" stroke="#8b8d72" stroke-width="1"/>';
        for(let y=-76;y<-28;y+=8) sail+=`<path d="M2 ${y}h18" stroke="#7f8269" stroke-width="1.2"/>`;
        sail+='<path d="M0-88v7" stroke="#a85745" stroke-width="3.5"/>';
        sails+=`<g class="windmill-sail" transform="rotate(${angle})">${sail}</g>`;
      }
      art+=`<g transform="matrix(.88 .24 0 1 ${hub[0]} ${hub[1]})"><g class="windmill-sails">${sails}</g><circle r="6.5" fill="#e6dbc0" stroke="#536454" stroke-width="2"/><circle r="2" fill="#59624e"/></g>`;
    } else if (kind === 'huygens') {
      const wings=[-102,-39,24,87];
      art+=block(-71,-110,142,232,3,['#a5ad97','#8b987f','#c8d1b0']);
      for(const y of wings.slice(0,-1)) {
        art+=face([[-60,y+29,3],[-11,y+29,3],[-11,y+60,3],[-60,y+60,3]],'#90ad67');
        art+=face([[35,y+29,3],[63,y+29,3],[63,y+60,3],[35,y+60,3]],'#9ab676');
        art+=block(-15,y+29,4,31,1,['#dddcc8','#dddcc8','#e4e1d1'],3);
      }
      // Four parallel wings and an offset spine follow the aerial and map footprint.
      for(const [index,y] of wings.entries()) {
        const x=-63,w=126,d=26,h=44;
        const end=z=>x+w-3+5*z/h;
        let wing=face([[x,y+d,3],[end(3),y+d,3],[end(h),y+d,h],[x,y+d,h]],'#75ae91');
        for(let z=9;z<h-6;z+=11) {
          wing+=face([[x+3,y+d,z],[end(z)-3,y+d,z],[end(z+5)-3,y+d,z+5],[x+3,y+d,z+5]],'#32635b');
        }
        for(let z=5;z<h;z+=3) wing+=face([[x,y+d,z],[end(z),y+d,z],[end(z+.6),y+d,z+.6],[x,y+d,z+.6]],'#abd1af');
        for(let dx=6;dx<w-4;dx+=13) wing+=face([[x+dx,y+d,4],[x+dx+.7,y+d,4],[x+dx+.7,y+d,h],[x+dx,y+d,h]],'#bddbc4');
        wing+=face([[end(3),y,3],[end(3),y+d,3],[end(h),y+d,h],[end(h),y,h]],'#436f77');
        wing+=face([[end(7),y+2,7],[end(7),y+9,7],[end(h-2),y+22,h-2],[end(h-2),y+13,h-2]],'#7fadb0');
        for(let dy=0;dy<=d;dy+=6.5) wing+=face([[end(3),y+dy,3],[end(3),y+dy+.6,3],[end(h),y+dy+.6,h],[end(h),y+dy,h]],'#b7d4cd');
        for(let z=5;z<h;z+=11) wing+=face([[end(z),y,z],[end(z),y+d,z],[end(z+.8),y+d,z+.8],[end(z+.8),y,z+.8]],'#b7d4cd');
        wing+=block(x-3,y-3,w+9,d+6,2,['#e6e9df','#bfcac2','#edf0e6'],h);
        wing+=face([[x+2,y+1,h+2.1],[x+w,y+1,h+2.1],[x+w,y+d-1,h+2.1],[x+2,y+d-1,h+2.1]],'#636c68');
        for(const dx of [12,50]) wing+=block(x+dx,y+7,15,10,3,['#a9b4af','#7d8c86','#c5cec7'],h+2.2);
        art+=`<g class="huygens-wing" data-wing="${index+1}">${wing}</g>`;
        if(index<wings.length-1) {
          const start=y+d,endY=wings[index+1],height=40;
          let connector=block(-7,start,38,endY-start,height,['#83a5a1','#678e91','#aec7c5']);
          for(let z=7;z<height;z+=8) connector+=face([[31,start,z],[31,endY,z],[31,endY,z+.8],[31,start,z+.8]],'#cee0d6');
          for(let py=start+3;py<endY;py+=7) {
            connector+=face([[31,py,3],[31,py+.8,3],[31,py+.8,height],[31,py,height]],'#c3d9d3');
            connector+=face([[-5,py,height+.1],[29,py,height+.1],[29,py+2,height+.1],[-5,py+2,height+.1]],'#d0ddd5');
          }
          art+=`<g class="huygens-connector">${connector}</g>`;
        }
      }
      art+=block(-49,118,78,6,8,['#ad7757','#86543d','#86a16b']);
      art+=sign('HUYGENSGEBOUW',-46,125,2,5,'#fff3dd');
    } else if (kind === 'erasmus') {
      art+=block(-83,-52,166,125,5,['#b1b9b5','#99a6a0','#dce0d5']);
      art+=block(-62,-36,124,72,300,['#d7d5c6','#acb4ae','#e4e6dc']);
      for(let floor=0;floor<20;floor++) {
        const z=18+floor*13;
        let windows=face([[-59,36,z],[59,36,z],[59,36,z+7],[-59,36,z+7]],'#486c7b');
        for(let col=0;col<10;col++) {
          const x=-57+col*11.6,color=['#7794a0','#668896','#a6b6b6','#d4d4be'][(col+floor*3)%4];
          windows+=face([[x,36.1,z+.7],[x+9.6,36.1,z+.7],[x+9.6,36.1,z+6.4],[x,36.1,z+6.4]],color);
        }
        windows+=face([[62,-31,z],[62,32,z],[62,32,z+7],[62,-31,z+7]],'#486570');
        for(let y=-28;y<32;y+=12) windows+=face([[62.1,y,z+.7],[62.1,y+9,z+.7],[62.1,y+9,z+6.4],[62.1,y,z+6.4]],'#6f909a');
        art+=`<g class="erasmus-floor">${windows}</g>`;
      }
      art+=block(-65,-39,130,78,4,['#e4e3d7','#bdc6bd','#e5e8de'],300);
      art+=block(-29,-20,58,40,29,['#85968e','#697d76','#a3b0a6'],304);
      art+=sign('RADBOUD',-23,21,319,6.5,'#f5f4e7');
      art+=sign('UNIVERSITEIT',-25,21,310,4.5,'#f5f4e7');
      art+=sign('Radboud Universiteit',-54,37,289,7.2,'#56655f');
      const antenna=point(-22,-15,333);
      art+=`<path d="M${antenna}v-12" stroke="#93a299" stroke-width="1.2"/>`;
      art+=block(-80,39,133,31,25,['#a2b1aa','#7f938d','#d4dbd1']);
      for(let x=-74;x<44;x+=17) art+=windowPane(x,71,6,13,14,'#658b94');
      art+=block(-19,65,44,20,3,['#eef0e6','#bacac3','#eff2e8'],21);
      art+=face([[-12,71,0],[18,71,0],[18,71,20],[-12,71,20]],'#466f78');
      art+=sign('ERASMUS',-16,86,14,6,'#5e7169');
    } else if (kind === 'mall') {
      art+=block(-104,-40,202,96,65,['#f3dfb4','#d0b78f','#e9cca0']);
      for(let c=0;c<5;c++) art+=windowPane(-94+c*38,57,8,31,42,'#89b5ce');
      art+=block(-111,-48,216,112,8,['#d28a64','#b36b4e','#e5ac7f'],65);
      for(let c=0;c<10;c++) art+=face([[-105+c*20,56,48],[-85+c*20,56,48],[-85+c*20,77,37],[-105+c*20,77,37]],c%2?'#fff3d8':'#d36c50');
      art+=block(-52,-4,83,39,19,['#bad1e2','#8caec8','#eaf3f8'],73);
      art+=block(-94,65,24,16,8,['#658777','#507665','#80a391']);
      art+=block(67,66,24,16,8,['#658777','#507665','#80a391']);
    } else if (kind === 'post') {
      art+=block(-77,-43,130,94,59,['#eed29b','#c8a677','#f4deb2']);
      art+=block(-83,-48,143,104,8,['#71927c','#4c7364','#8ba18a'],59);
      art+=windowPane(-65,52,17,32,26)+windowPane(13,52,0,26,38,'#4b759c');
      art+=face([[-28,52,22],[3,52,22],[3,52,42],[-28,52,42]],'#fff');
      const envelope=[[-28,52,42],[-12,52,28],[3,52,42]].map(p=>point(...p).join(',')).join(' ');
      art+=`<polyline points="${envelope}" fill="none" stroke="#567e9f" stroke-width="1.6"/>`;
      art+=block(70,38,21,21,32,['#cd7059','#a84f40','#e3916f']);
      art+=face([[73,60,23],[88,60,23],[88,60,26],[73,60,26]],'#dceafa');
      art+=block(-60,-23,28,26,19,['#c5d5e1','#a3becf','#e1ebf2'],67);
    } else {
      art+=face([[-90,-60,1],[70,-60,1],[70,60,1],[-90,60,1]],'#9ab65d');
      art+=face([[-65,-45,0],[30,-45,0],[-18,-45,68]],'#417f8b');
      art+=face([[-18,-45,68],[30,-45,0],[30,35,0],[-18,35,68]],'#5c9da6');
      art+=face([[-65,35,0],[30,35,0],[-18,35,68]],'#e0c272');
      art+=face([[-47,35,0],[13,35,0],[-18,35,54]],'#355f64');
      art+=face([[-18,35,54],[13,35,0],[-8,35,0]],'#75b4b9');
      const [fx,fy]=point(60,-20,0); // fire pit on the open grass beside the tent
      art+=`<g transform="translate(${fx} ${fy})"><ellipse cy="5" rx="23" ry="10" fill="#c5b082"/><path d="M-15 7L15-3M-14-3L16 7" stroke="#775039" stroke-width="6" stroke-linecap="round"/><g class="camp-flame"><path d="M0 3C-23-7-9-24-6-30-5-17 3-18 2-43 29-12 19 2 0 3" fill="#e77839"/><path d="M0 3C-12-7-4-16 1-27 1-12 15-7 0 3" fill="#ffda70"/></g></g>`;
      art+=tree(30,148,.8);
    }
    return `<svg class="town-art-${kind}" viewBox="0 ${-rise} 260 ${225+rise}" aria-hidden="true">${art}</svg>`;
  }
  // One ground projection keeps streets, coastline, and building positions aligned.
  const ground = (x,y,z=0) => [480 + .63*x - .53*y, 140 + .26*x + .31*y - z];
  const groundFace = (points,color) => polygon(points.map(p=>ground(...p).join(',')).join(' '),color);
  const tile = (x,y,w,d,color) => groundFace([[x,y],[x+w,y],[x+w,y+d],[x,y+d]],color);
  const line = (a,b,color,width=2,dash='') => `<path d="M${ground(...a)}L${ground(...b)}" fill="none" stroke="${color}" stroke-width="${width}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
  function shore(y) {
    let d = `M${ground(0,y)}`;
    for(let x=0;x<1100;x+=100) d+=`Q${ground(x+25,y-12)} ${ground(x+50,y)}T${ground(x+100,y)}`;
    return d;
  }
  let landscape = '';
  // Diorama base: soil and water edges under the visible sides.
  landscape += groundFace([[0,905,0],[1100,905,0],[1100,905,-30],[0,905,-30]],'#3e7b8d');
  landscape += groundFace([[1100,760,0],[1100,905,0],[1100,905,-30],[1100,760,-30]],'#4b8b9d');
  landscape += groundFace([[1100,0,0],[1100,760,0],[1100,760,-30],[1100,0,-30]],'#a48a67');
  landscape += groundFace([[1100,0,0],[1100,760,0],[1100,760,-7],[1100,0,-7]],'#7f9a4c');
  landscape += groundFace([[0,760],[1100,760],[1100,905],[0,905]],'#65aabb');
  landscape += groundFace([[0,865],[1100,865],[1100,905],[0,905]],'#4f92a5');
  landscape += `<g class="night-sea">
    <defs><linearGradient id="sea-depth" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1" gradientTransform="matrix(693 286 -77 45 ${ground(0,760).join(' ')})">
      <stop offset="0" stop-color="#639f9e"/><stop offset=".52" stop-color="#397e93"/><stop offset=".8" stop-color="#285e83"/><stop offset="1" stop-color="#214b72"/>
    </linearGradient></defs>
    ${tile(0,760,1100,145,'url(#sea-depth)')}
    ${groundFace([[0,905,0],[1100,905,0],[1100,905,-30],[0,905,-30]],'#193e57')}
    ${groundFace([[1100,760,0],[1100,905,0],[1100,905,-30],[1100,760,-30]],'#24506a')}
  </g>`;
  const landEnd = 760, beachEnd = 809;
  landscape += groundFace([[1100,landEnd],[1100,beachEnd],[1100,beachEnd,-30],[1100,landEnd,-30]],'#b49969');
  landscape += `<path d="${shore(beachEnd)}L${ground(1100,landEnd)}L${ground(0,landEnd)}Z" fill="#edcf88"/>`;
  landscape += `<g><path class="sea-wave" d="${shore(815)}" fill="none" stroke="#fff9e8" stroke-width="6"/><path class="sea-wave" d="${shore(855)}" fill="none" stroke="#b9e0df" stroke-width="2"/></g>`;
  landscape += tile(0,0,1100,landEnd,'#9db466');
  landscape += groundFace([[1100,0],[1100,landEnd],[1100,landEnd,-12],[1100,0,-12]],'#a7a991');
  for(const m of modules) landscape += tile(...m.lot);
  landscape += tile(534,652,228,84,'#a9c379');
  // The southern street ends at the campus, leaving its larger parcel uninterrupted.
  const crossStreets=[{y:270,start:0},{y:595,start:470}];
  const avenues=[470,820];
  for(const {y,start} of crossStreets) landscape += tile(start,y-52,1100-start,104,'#dcd8cd');
  for(const x of avenues) landscape += tile(x-52,0,104,760,'#dcd8cd');
  for(const {y,start} of crossStreets) landscape += tile(start,y-32,1100-start,64,'#8a9094');
  for(const x of avenues) landscape += tile(x-32,0,64,760,'#8a9094');
  for(const {y,start} of crossStreets) landscape += line([start,y],[1100,y],'#f3f1dc',2,'12 10');
  for(const x of avenues) landscape += line([x,0],[x,760],'#f3f1dc',2,'12 10');
  for(const x of avenues) for(const {y} of crossStreets) {
    for(let k=0;k<6;k++) landscape += tile(x-27+k*10,y-69,5,30,'#faf7e8');
    for(let k=0;k<6;k++) landscape += tile(x+42,y-27+k*10,30,5,'#faf7e8');
  }
  // A sheltered pond behind Huygens, simplified from the campus waterside garden.
  const pondOutline=`M${ground(39,373)}C${ground(72,344)} ${ground(138,341)} ${ground(157,369)}C${ground(176,397)} ${ground(148,414)} ${ground(160,440)}C${ground(179,467)} ${ground(142,491)} ${ground(103,504)}C${ground(63,519)} ${ground(31,492)} ${ground(30,461)}C${ground(26,433)} ${ground(10,402)} ${ground(39,373)}Z`;
  let pond=`<g class="campus-pond"><path d="${pondOutline}" fill="#709678" stroke="#809e59" stroke-width="13" stroke-linejoin="round"/><path d="${pondOutline}" fill="#76afa6" stroke="#b4ba86" stroke-width="4"/>`;
  pond+=`<path d="M${ground(39,388)}C${ground(66,356)} ${ground(124,354)} ${ground(148,377)}" fill="none" stroke="#d0dbc1" stroke-width="2" opacity=".7"/>`;
  pond+=`<path d="M${ground(39,434)}C${ground(32,478)} ${ground(90,502)} ${ground(129,475)}" fill="none" stroke="#5b948e" stroke-width="8" opacity=".45"/>`;
  for(const [x,y,width] of [[76,375,15],[57,444,20],[136,458,13],[79,485,12]]) {
    const p=ground(x,y);
    pond+=`<g transform="translate(${p})"><path class="pond-ripple" d="M${-width/2} 0q${width/2} 4 ${width} 0" fill="none" stroke="#dcebe0" stroke-width="1.2" stroke-linecap="round"/></g>`;
  }
  function duck(x,y,female=false,direction=1,delay=0) {
    const p=ground(x,y);
    const body=female?'#b89463':'#d1d1b9',wing=female?'#886641':'#939c91',head=female?'#977648':'#286f50';
    return `<g transform="translate(${p})"><g class="pond-duck" style="animation-delay:${delay}s"><ellipse cy="2" rx="15" ry="3.5" fill="none" stroke="#dceae0" stroke-width="1" opacity=".7"/><g transform="scale(${direction} 1)"><path d="M-6-3L-14-9-10-1Z" fill="${wing}"/><ellipse cy="-3" rx="9" ry="5" fill="${body}"/><ellipse cx="-1" cy="-5" rx="6" ry="3" fill="${wing}"/><path d="M-4-4h6" stroke="#4e77a2" stroke-width="2"/><path d="M5-4V-11" stroke="${female?'#b89463':'#986544'}" stroke-width="6" stroke-linecap="round"/>${female?'':'<path d="M2-9h6" stroke="#f4efdb" stroke-width="1.5"/>'}<circle cx="6" cy="-13" r="4.7" fill="${head}"/><path d="M10-13l6 1-6 2Z" fill="#e1b35b"/><circle cx="7.8" cy="-14.5" r=".8" fill="#202f2b"/>${female?'<path d="M2-14h7" stroke="#c7ad7d" stroke-width="1"/>':''}</g></g></g>`;
  }
  pond+=duck(62,401,false,1,-1)+duck(99,459,true,-1,-5)+duck(55,451,false,1,-8);
  for(const [x,y] of [[26,425],[46,484],[145,365],[160,468]]) {
    const p=ground(x,y);
    pond+=`<g transform="translate(${p})"><path d="M0 0L-2-20M3 0L7-16M-3 0L-8-13M1-2Q-10-13-11-7M3-1Q13-13 11-5" fill="none" stroke="#63834d" stroke-width="1.5" stroke-linecap="round"/><path d="M-2-20l-.5-5M7-16l1-4" stroke="#967344" stroke-width="3" stroke-linecap="round"/></g>`;
  }
  for(const x of [44,76]) pond+=line([x,536,0],[x,536,10],'#7a7157',2.5)+line([x,548,0],[x,548,10],'#7a7157',2.5);
  pond+=groundFace([[40,535,10],[84,535,10],[84,549,10],[40,549,10]],'#bd965f');
  pond+=groundFace([[40,535,17],[84,535,17],[84,535,25],[40,535,25]],'#caa674');
  pond+=line([40,542,10.2],[84,542,10.2],'#997548',1);
  landscape+=pond+'</g>';
  // Promenade, small jetty, and beach furniture.
  landscape += tile(0,746,1100,14,'#d5c7a8');
  // Jetty: a raised deck on piles, from the promenade out over the water (kept above the waves, see sprites).
  {
    const X0=462,X1=502,Y0=760,Y1=874,Z=7; let j='';
    for(const y of [792,832,870]) for(const x of [X0+3,X1-3]) j+=line([x,y,-8],[x,y,Z],'#6b4e2e',4);   // piles
    j+=groundFace([[X0,Y1,Z],[X1,Y1,Z],[X1,Y1,Z-3],[X0,Y1,Z-3]],'#7d5a36');                          // end face
    j+=groundFace([[X1,Y0,Z],[X1,Y1,Z],[X1,Y1,Z-3],[X1,Y0,Z-3]],'#8a6440');                          // side face
    j+=groundFace([[X0,Y0,Z],[X1,Y0,Z],[X1,Y1,Z],[X0,Y1,Z]],'#b88a58');                              // deck
    for(let y=Y0+8;y<Y1;y+=8) j+=line([X0,y,Z],[X1,y,Z],'#94693f',1.2);                             // plank seams
    // A small rowboat moored alongside, rope tied to the deck.
    const hull=[[516,824],[522,832],[522,858],[519,866],[513,866],[510,858],[510,832]], HZ=3;
    hull.forEach((a,i)=>{const b=hull[(i+1)%hull.length], nx=b[1]-a[1], ny=a[0]-b[0];          // outward normal (clockwise outline)
      if(nx>0||ny>0) j+=groundFace([[...a,HZ],[...b,HZ],[...b,-1],[...a,-1]],nx>0?'#a8402d':'#8f3526');});
    j+=groundFace(hull.map(([x,y])=>[x,y,HZ]),'#c9533b');                                       // gunwale
    j+=groundFace([[516,829],[519.5,834],[519.5,857],[517.5,862],[514.5,862],[512.5,857],[512.5,834]].map(([x,y])=>[x,y,1]),'#8a6440'); // inside
    j+=line([512.5,846,1.6],[519.5,846,1.6],'#c49a66',2.2)+line([512.5,855,1.6],[519.5,855,1.6],'#c49a66',2);  // seats
    j+=`<path d="M${ground(X1,836,Z-1)}Q${ground(510,832,0)} ${ground(516,826,HZ)}" fill="none" stroke="#efe2c4" stroke-width="1"/>`;  // rope
    // Someone fishing from the end of the jetty, legs over the edge.
    const sitAt=ground(480,Y1-2,Z), [sx2,sy2]=sitAt, tip=ground(474,Y1+20,Z+22), bob=ground(475,Y1+23,-1);
    j+=`<path d="M${tip}L${bob}" stroke="#f4f1e6" stroke-width=".6" opacity=".9"/><circle cx="${bob[0].toFixed(1)}" cy="${bob[1].toFixed(1)}" r="1.4" fill="#e8483b"/>`;
    const PS=.76;   // Scale around the seat so the hips stay on the deck edge.
    j+=`<g transform="translate(${sx2.toFixed(1)} ${sy2.toFixed(1)}) scale(${PS})">
      <path d="M-2.5 0l-2.6 1.5-.8 5-1.5 .4M2 0l-1.8 2.2.3 5-1.4 .5" fill="none" stroke="#3b4256" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="-4" y="-11" width="8" height="11" rx="3.5" fill="#e0a43a"/>
      <circle cy="-14" r="3.3" fill="#f2cfae"/><path d="M-3.6 -14.5q0-4 3.6-4t3.6 4z" fill="#3f6e9e"/><path d="M0 -15h-5" stroke="#3f6e9e" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M-3 -7l-4 2" stroke="#e0a43a" stroke-width="2" stroke-linecap="round"/></g>`;
    j+=`<path d="M${(sx2-7*PS).toFixed(1)} ${(sy2-5*PS).toFixed(1)}L${tip}" stroke="#6b4e2e" stroke-width="1.1" stroke-linecap="round"/>`;
    landscape += `<g class="jetty">${j}</g>`;
  }
  landscape += tile(138,770,25,43,'#d08068')+tile(185,779,28,40,'#91bccc');
  const [ux,uy]=ground(173,766);
  landscape += `<g transform="translate(${ux} ${uy})"><path d="M0 0v-31" stroke="#9c784e" stroke-width="3"/><path d="M-25-28Q0-52 25-28Q0-14-25-28" fill="#f0b85e"/><path d="M-25-28Q-10-46 0-43L0-21Z" fill="#f9e9b8"/></g>`;
  // Tulip beds: striped rows, Dutch bulb-field style.
  const TULIP=['#e0433a','#f3c443','#ef8fb2','#f08a3c','#8d5bb0','#f7efe2'];
  function tulipBed(x,y,w,d,colors,step=8,gap=14) {
    let bed='';
    colors.forEach((c,i)=>{
      const ry=y+6+i*gap; if(ry>y+d-2) return;
      bed+=line([x,ry],[x+w,ry],'#6f9a45',3);
      for(let tx=x+3;tx<x+w-1;tx+=step){const p=ground(tx,ry);bed+=`<use href="#tulip" x="${p[0].toFixed(1)}" y="${p[1].toFixed(1)}" color="${c}"/>`;}
    });
    return `<g class="tulip-bed" data-bed="${x},${y}">${tile(x-3,y-2,w+6,d+4,'#8a7a55')}${bed}</g>`;
  }
  // Positions checked by rendering: no building, tree, lamp or bed overlaps another.
  const TULIP_BEDS=[[585,666,155,62],[714,19,50,38],[993,332,50,36],[51,125,44,32]];
  for(const [i,[x,y,w,d]] of TULIP_BEDS.entries()) landscape+=tulipBed(x,y,w,d,[0,1,2,3,4,5].map(k=>TULIP[(k+i*2)%TULIP.length]));
  // Upright things (trees, lamps, tower, cars) are drawn back to front by their ground y,
  // so a car on a street passes in front of the trees behind it and behind the ones in front.
  const props=[];
  for (const [x,y,s] of [[22,220,.65],[385,180,.72],[535,195,.65],[745,345,.7],[877,210,.75],[1055,323,.6],[14,348,.6],[37,680,.8],[521,710,.7],[525,538,.65],[870,476,.6],[883,545,.6],[1098,470,.72],[565,705,.75],[751,665,.7],[430,110,.65]]) {
    const p=ground(x,y);
    props.push([y,tree(p[0],p[1],s)]);
  }
  for(const [x,y] of [[414,177],[893,326],[549,649],[878,652]]) {
    const p=ground(x,y);
    props.push([y,`<g class="obj-lamp" transform="translate(${p})"><ellipse cy="3" rx="8" ry="3" fill="#687750" opacity=".3"/><path d="M0 0v-48h10" fill="none" stroke="#5d645c" stroke-width="3"/><circle cx="10" cy="-47" r="5" fill="#ffe5a2"/></g>`]);
  }
  // The lattice tower sits at the far edge of the coastal district.
  const [tx,ty]=ground(1080,25);
  props.push([25,`<g class="obj-tower" transform="translate(${tx} ${ty})"><ellipse cy="3" rx="23" ry="8" fill="#788052" opacity=".25"/><path d="M-21 0L-5-108H5L21 0M-15-28H15M-10-57H10M-6-85H6M-20-1L14-29-10-57 6-85M20-1L-14-29 10-57-6-85M0-108v-26" fill="none" stroke="#545955" stroke-width="3" stroke-linejoin="round"/><path d="M-10-108H10" stroke="#545955" stroke-width="4"/><circle cy="-137" r="4" fill="#d87553"/></g>`]);
  // Cars are their own small layers, moved by the graphics card (see moveCars below), so the
  // large static drawings never have to be redrawn while they drive.
  const CAR_VB=[-60,-55,120,80];
  function car(color,from,to,extra='') {
    let shape=block(-40,-15,80,30,18,[color,'#a64f42',color]);
    shape+=block(-25,-13,44,26,16,['#d6e7df','#92bdc1','#f4e3bd'],18);
    for(const x of [-23,-6,11]) shape+=windowPane(x,14,21,12,10,'#79a9b2');
    for(const x of [-24,25]) {const p=point(x,17,0);shape+=`<ellipse cx="${p[0]}" cy="${p[1]}" rx="7" ry="8" fill="#4d524d"/><circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#d6d6ba"/>`;}
    const a=ground(...from),b=ground(...to),[vx,vy,vw,vh]=CAR_VB;
    return `<svg class="town-car-sprite ${extra}" viewBox="${CAR_VB.join(' ')}" aria-hidden="true" data-dx="${(b[0]-a[0]).toFixed(2)}" data-dy="${(b[1]-a[1]).toFixed(2)}" style="left:${(a[0]+vx)/12}%;top:${(a[1]+vy)/8}%;width:${vw/12}%;height:${vh/8}%"><g transform="translate(-130 -146)">${shape}</g></svg>`;
  }
  // Upright things are drawn back to front. Buildings are separate layers above the ground, and the
  // two streets carry cars, so the props are split into three static layers by depth:
  //   back (north of the north street) · car 1 · middle · [buildings] · car 2 · front (south of the south street)
  const N_STREET=270, S_STREET=595; let mid='', front='';
  props.sort((m,n)=>m[0]-n[0]).forEach(([y,svg])=>{ if(y>=S_STREET) front+=svg; else if(y>=N_STREET) mid+=svg; else landscape+=svg; });
  const VB='viewBox="0 0 1200 800" aria-hidden="true"';
  map.innerHTML = `<svg class="town-ground" ${VB}><defs><g id="tulip"><path d="M0 0v-6" stroke="#4f7a35" stroke-width="1.3"/><path d="M-2.4-5.5q-.3-3.6 .9-4.6l1.5 1.6 1.5-1.6q1.2 1 .9 4.6z" fill="currentColor"/></g></defs>${landscape}</svg>`
    + car('#d77357',[60,270],[1060,270])
    + `<svg class="town-mid" ${VB}>${mid}</svg>`
    + car('#e6c46f',[535,595],[1050,595],'second-car is-front')
    + `<svg class="town-front" ${VB}>${front}</svg>`;
  function openModule(m) {
    if (m.id === 'cv') {
      const cvLink = document.querySelector('.masthead a[href$="xxy_CV.pdf"]');
      if (cvLink) window.open(cvLink.href, '_blank', 'noopener');
      return;
    }
    panel.replaceChildren();
    panel.dataset.module=m.id;
    if (m.id === 'about-me') {
      const photo = document.querySelector('.author__avatar img').cloneNode();
      photo.className = 'town-person';
      panel.append(photo);
    }
    for (const node of sections.get(m.id)) {
      const copy = node.cloneNode(true);
      if (copy.nodeType === 1) {
        copy.removeAttribute('id');
        copy.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
      }
      panel.append(copy);
    }
    document.getElementById('town-dialog-title').textContent = m.title;
    document.getElementById('town-place').textContent = m.place;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }
  for (const m of modules) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'town-building';
    const anchor=ground(m.x,m.y);
    // Extra headroom preserves the ground anchor without shrinking taller landmarks.
    const rise=m.rise||0,headroom=rise*210/260;
    button.style.width = 17.5*m.scale + '%';
    button.style.height = (224+headroom)*m.scale/800*100 + '%';
    button.style.left = (anchor[0]-105*m.scale)/1200*100 + '%';
    button.style.top = (anchor[1]-118*m.scale-headroom*m.scale)/800*100 + '%';
    button.style.zIndex = Math.round(anchor[1]);
    button.setAttribute('aria-label', `${m.title} – ${m.place}`);
    button.dataset.module = m.id;
    button.innerHTML = building(m.kind,rise);
    button.addEventListener('click', () => openModule(m));
    map.append(button);
  }
  document.getElementById('town-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  });
  const navigation = document.getElementById('town-nav');
  const menuButton = navigation.querySelector('button');
  function closeMenu() {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
  menuButton.addEventListener('click', () => {
    const expanded = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(expanded));
  });
  document.addEventListener('click', e => { if (!navigation.contains(e.target)) closeMenu(); });
  navigation.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeMenu(); menuButton.focus(); }
  });
  // Capture section links before the template's smooth-scroll handler targets hidden content.
  document.querySelector('.masthead').addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const m = modules.find(item => '#' + item.id === link.hash);
    if (!m) return;
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
    if (m.id === 'about-me' || m.id === 'news') {
      document.querySelector('h1#'+m.id).scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    } else openModule(m);
  }, true);

  // ---------- Labels, hover focus, status badges ----------
  const buttons=[...map.querySelectorAll('.town-building')];
  const moduleOf=b=>modules.find(m=>m.id===b.dataset.module);
  const layer=document.createElement('div'); layer.className='town-labels'; map.append(layer);
  for(const b of buttons){
    const mod=moduleOf(b), t=mod.title;
    const l=document.createElement('button'); l.type='button'; l.className='town-label'; l.tabIndex=-1;
    l.innerHTML=`<span class="tl-title">${t}</span>`;
    // Label floats just above the building's roof (map units, measured from the art).
    l.style.left=mod.label[0]/12+'%'; l.style.top=mod.label[1]/8+'%';
    l.addEventListener('click',()=>b.click());
    const on=()=>{map.classList.add('has-hot');b.classList.add('is-hot');l.classList.add('is-hot')}, off=()=>{map.classList.remove('has-hot');b.classList.remove('is-hot');l.classList.remove('is-hot')};
    for(const el of [b,l]){el.addEventListener('mouseenter',on);el.addEventListener('mouseleave',off);}
    b.addEventListener('focus',on);b.addEventListener('blur',off);
    layer.append(l);
  }
  // ---------- Day/night cycle ----------
  // Driven from the real sun position over Beijing.
  //     Preview: ?time=17:10 (today, Beijing) and optionally &date=2026-06-21
  const town=document.getElementById('town');
  const RAD=Math.PI/180, LAT=39.9, LON=116.4;
  function sunPos(ms){
    const d=(ms-946728000000)/864e5;
    const g=(357.529+.98560028*d)*RAD, q=280.459+.98564736*d;
    const L=(q+1.915*Math.sin(g)+.020*Math.sin(2*g))*RAD, ob=(23.439-.00000036*d)*RAD;
    const ra=Math.atan2(Math.cos(ob)*Math.sin(L),Math.cos(L)), dec=Math.asin(Math.sin(ob)*Math.sin(L));
    const gmst=((18.697374558+24.06570982441908*d)%24+24)%24;
    const H=(gmst*15+LON)*RAD-ra, la=LAT*RAD;
    const alt=Math.asin(Math.sin(la)*Math.sin(dec)+Math.cos(la)*Math.cos(dec)*Math.cos(H));
    const az=Math.atan2(-Math.sin(H),Math.tan(dec)*Math.cos(la)-Math.sin(la)*Math.cos(H));
    return {alt:alt/RAD, az:(az/RAD+360)%360, lon:L};
  }
  // Moon (low-precision series, good to about a degree): position over Beijing and phase.
  function moonPos(ms){
    const d=(ms-946728000000)/864e5, e=23.4397*RAD;
    const Lm=(218.316+13.176396*d)*RAD, M=(134.963+13.064993*d)*RAD, F=(93.272+13.229350*d)*RAD;
    const l=Lm+6.289*RAD*Math.sin(M), b=5.128*RAD*Math.sin(F);
    const ra=Math.atan2(Math.sin(l)*Math.cos(e)-Math.tan(b)*Math.sin(e),Math.cos(l));
    const dec=Math.asin(Math.sin(b)*Math.cos(e)+Math.cos(b)*Math.sin(e)*Math.sin(l));
    const gmst=((18.697374558+24.06570982441908*d)%24+24)%24;
    const H=(gmst*15+LON)*RAD-ra, la=LAT*RAD;
    const alt=Math.asin(Math.sin(la)*Math.sin(dec)+Math.cos(la)*Math.cos(dec)*Math.cos(H));
    const az=Math.atan2(-Math.sin(H),Math.tan(dec)*Math.cos(la)-Math.sin(la)*Math.cos(H));
    return {alt:alt/RAD, az:(az/RAD+360)%360, lon:l};
  }
  // Lit shape of the moon disc (radius 20, centred on 0,0) for an elongation from the sun in radians.
  function moonShape(elong){
    const el=((elong%(2*Math.PI))+2*Math.PI)%(2*Math.PI), k=(1-Math.cos(el))/2;   // illuminated fraction
    const rx=(20*Math.abs(1-2*k)).toFixed(2), gib=k>.5?1:0;
    const path=`M0 -20A20 20 0 0 1 0 20A${rx} 20 0 0 ${gib} 0 -20Z`;               // lit on the right
    return {k, path, flip: el>Math.PI};                                             // waning: lit on the left
  }
  const params=new URLSearchParams(location.search);
  function now(){
    const t=params.get('time'); if(!t) return Date.now();
    const [hh,mm]=t.split(':').map(Number);
    const ds=params.get('date')||new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date());
    const [y,m,dd]=ds.split('-').map(Number);
    return Date.UTC(y,m-1,dd,hh-8,mm||0);
  }
  const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};

  // Sky layers, sun, clouds, moon, stars
  let seed=7; const rnd=()=>((seed=seed*16807%2147483647)/2147483647);
  const sky=document.createElement('div'); sky.className='town-sky'; sky.setAttribute('aria-hidden','true');
  let stars=''; for(let i=0;i<34;i++){const x=rnd()*100,y=rnd()*38,r=rnd()<.25?1.6:1;stars+=`<i style="left:${x}%;top:${y}%;width:${r*2}px;height:${r*2}px;animation-delay:${(rnd()*4).toFixed(1)}s"></i>`;}
  sky.innerHTML=`<div class="sky sky-day"></div><div class="sky sky-dusk"></div><div class="sky sky-night"></div>
    <div class="town-stars">${stars}</div><span class="town-moon"><svg viewBox="-24 -24 48 48" aria-hidden="true"><defs><clipPath id="moon-lit"><path/></clipPath>
      <radialGradient id="moon-face" cx="40%" cy="38%"><stop offset="0" stop-color="#fffdf3"/><stop offset=".6" stop-color="#f3efdc"/><stop offset="1" stop-color="#e2dcc2"/></radialGradient></defs>
      <circle r="20" fill="#dfe6ff" opacity=".07"/>
      <g class="moon-lit"><g clip-path="url(#moon-lit)"><circle r="20" fill="url(#moon-face)"/><circle cx="-6" cy="4" r="4" fill="#d6ceb0" opacity=".55"/><circle cx="5" cy="-6" r="2.6" fill="#d6ceb0" opacity=".55"/><circle cx="8" cy="8" r="2" fill="#d6ceb0" opacity=".45"/></g></g></svg></span><span class="town-sun"></span>
    <span class="town-cloud c1"></span><span class="town-cloud c2"></span><span class="town-cloud c3"></span>`;
  town.prepend(sky);

  // ---------- Performance: moving parts get their own small layers ----------
  // Anything animated inside a big drawing would force the whole drawing (and its colour filter)
  // to be redrawn every frame. Each moving part is moved into a small SVG of its own instead.
  document.body.classList.add('town-ready');            // the map must be laid out to measure it
  const NS='http://www.w3.org/2000/svg';
  const toRoot=(el,root)=>root.getScreenCTM().inverse().multiply(el.parentNode.getScreenCTM());
  const wrap=(el,m)=>{const g=document.createElementNS(NS,'g');g.setAttribute('transform',`matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`);g.append(el);return g;};
  // ground parts (waves, ripples, ducks): a small SVG cut to the part's area, positioned in map %
  function groundSprite(el,root,rr,pad){
    const r=el.getBoundingClientRect(), k=1200/rr.width;
    const x=(r.left-rr.left)*k-pad, y=(r.top-rr.top)*k-pad, w=r.width*k+2*pad, h=r.height*k+2*pad;
    const m=toRoot(el,root), sp=document.createElementNS(NS,'svg');
    sp.setAttribute('viewBox',`${x} ${y} ${w} ${h}`); sp.setAttribute('class','town-sprite'); sp.setAttribute('aria-hidden','true');
    Object.assign(sp.style,{left:x/12+'%',top:y/8+'%',width:w/12+'%',height:h/8+'%'});
    return {el,m,sp};
  }
  const groundSvg=map.querySelector('.town-ground'), after=groundSvg.nextSibling;
  const groundBounds=groundSvg.getBoundingClientRect(), sprites=[];
  for(const [sel,pad] of [['.sea-wave',8],['.pond-ripple',6],['.pond-duck',14],['.jetty',6]])   // jetty last: above the waves
    groundSvg.querySelectorAll(sel).forEach(el=>sprites.push(groundSprite(el,groundSvg,groundBounds,pad)));
  for(const {el,m,sp} of sprites){
    sp.append(wrap(el,m));
    map.insertBefore(sp,after);
  }
  // building parts (windmill sails, camp flame): an overlay with the building's own viewBox
  for(const b of buttons){
    const art=b.querySelector('svg');
    art.querySelectorAll('.windmill-sails,.camp-flame').forEach(el=>{
      const sp=document.createElementNS(NS,'svg'); sp.setAttribute('viewBox',art.getAttribute('viewBox'));
      sp.setAttribute('class','town-sprite town-part'); sp.setAttribute('aria-hidden','true');
      sp.append(wrap(el,toRoot(el,art))); b.append(sp);
    });
  }
  // cars: moved with a transform in pixels, recomputed when the map changes size
  const carAnims=[];
  function moveCars(){
    const k=map.getBoundingClientRect().width/1200/((map.style.transform.match(/scale\(([\d.]+)\)/)||[0,1])[1]);
    carAnims.splice(0).forEach(a=>a.cancel());
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    map.querySelectorAll('.town-car-sprite').forEach(c=>{
      const two=c.classList.contains('second-car');
      const an=c.animate([{transform:'translate(0,0)'},{transform:`translate(${c.dataset.dx*k}px,${c.dataset.dy*k}px)`}],
        {duration:two?23000:18000,iterations:Infinity,easing:'linear',direction:two?'reverse':'normal'});
      an.startTime=0; carAnims.push(an);
    });
  }
  moveCars();
  let lastW=map.offsetWidth; new ResizeObserver(()=>{ if(map.offsetWidth!==lastW){ lastW=map.offsetWidth; moveCars(); } }).observe(map);

  // Light layer: windows and street lamps, each switching on at its own moment
  const WIN=new Set(['#83b3d1','#658b94','#89b5ce','#7794a0','#668896','#a6b6b6','#d4d4be','#6f909a','#32635b','#628788','#79a9b2']);
  const lights=[];
  // Light layer: only the glowing windows and lamps, masked by a copy in which those shapes are
  // white and every shape drawn after them is black, so walls, roofs, mullions, awnings and trees
  // in front still hide them. Shapes drawn before the first light can never cover it and are left
  // out, which keeps the layers small. The layers contain nothing that moves, so they are drawn once.
  let maskId=0;
  const SHAPES='polygon,polyline,line,circle,ellipse,path,rect,use,text,image';
  const lit=(svg)=>{
    const c=svg.cloneNode(true), mk=svg.cloneNode(true), id='town-light-mask-'+(maskId++);
    c.setAttribute('class','town-lights');
    [c,mk].forEach(copy=>copy.querySelectorAll('defs').forEach(e=>e.remove()));
    const shop=svg.classList.contains('town-art-mall');           // shop windows all light up
    const cs=[...c.querySelectorAll(SHAPES)], ms=[...mk.querySelectorAll(SHAPES)];
    let first=-1;
    cs.forEach((e,i)=>{const m=ms[i], f=(e.getAttribute('fill')||'').toLowerCase();
      if(f==='#d8eef8'){e.remove();m.remove();return;}             // glass highlight never blocks light
      let on=false;
      if(e.tagName==='polygon'&&WIN.has(f)&&(shop||rnd()<.62)){e.setAttribute('fill',rnd()<.5?'#ffd27a':'#ffe3a8');lights.push([e,shop?.15+rnd()*.2:rnd()]);on=true;}
      else if(f==='#ffe5a2'&&e.tagName==='circle'){e.setAttribute('r','7');m.setAttribute('r','7');lights.push([e,rnd()*.25]);on=true;}
      if(on){ if(first<0) first=i; e.classList.add('lt');m.setAttribute('fill','#fff');m.removeAttribute('stroke');}
      else { e.remove();
        if(first<0) m.remove();
        else { if(m.getAttribute('fill')!=='none')m.setAttribute('fill','#000'); if(m.hasAttribute('stroke'))m.setAttribute('stroke','#000'); } }
    });
    if(first<0) return null;
    const g=document.createElementNS(NS,'g'); g.setAttribute('mask',`url(#${id})`);
    while(c.firstChild) g.append(c.firstChild);
    const defs=document.createElementNS(NS,'defs'), mask=document.createElementNS(NS,'mask');
    mask.setAttribute('id',id); mask.setAttribute('maskUnits','userSpaceOnUse');
    for(const [k,v] of [['x',-2000],['y',-2000],['width',5000],['height',5000]]) mask.setAttribute(k,v);
    while(mk.firstChild) mask.append(mk.firstChild);
    defs.append(mask); c.append(defs,g);
    return c;};
  const addLights=(svg,host)=>{const l=lit(svg); if(l) host.insertBefore(l,svg.nextSibling);};
  for(const b of buttons) addLights(b.querySelector('svg'),b);
  for(const cls of ['.town-ground','.town-mid','.town-front']) addLights(map.querySelector(cls),map);
  // Every animation in the town runs on one clock (pinned to the start of the document timeline).
  const pin=()=>map.getAnimations({subtree:true}).forEach(an=>an.ready.then(()=>{
    if (an.playState === 'running') an.startTime=0;
  }).catch(()=>{}));
  requestAnimationFrame(pin); addEventListener('load',pin);

  // Glints on the sea
  const G=(x,y)=>[480+.63*x-.53*y,140+.26*x+.31*y];
  let glints='';for(let i=0;i<22;i++){const x=40+rnd()*1020,y=790+rnd()*100,[px,py]=G(x,y),w=6+rnd()*14;glints+=`<path class="glint" d="M${(px-w/2).toFixed(1)} ${py.toFixed(1)}h${w.toFixed(1)}" style="animation-delay:${(rnd()*3).toFixed(1)}s"/>`;}
  // (No light wash over the island: a pale overlay made the buildings read as translucent.
  //  The scene colour filter alone carries the dusk and night tint.)
  // The glints move, so they get their own layer; the wash above is static and blends once.
  const gl=document.createElementNS('http://www.w3.org/2000/svg','svg');
  gl.setAttribute('viewBox','0 0 1200 800');gl.setAttribute('class','town-glints');gl.setAttribute('aria-hidden','true');
  gl.innerHTML=`<g class="glints-warm">${glints}</g>`;
  map.insertBefore(gl,map.querySelector('.town-sprite'));

  function update(){
    const t=now(), {alt:e,az,lon:sunLon}=sunPos(t), moon=moonPos(t), ph=moonShape(moon.lon-sunLon);
    const kNight=1-smooth(-9,-1,e), kDusk=smooth(-7,-1,e)*(1-smooth(2,10,e)), kSun=smooth(-2,1.5,e), kLight=1-smooth(-6,5,e);
    const set=(k,v)=>town.style.setProperty(k,v);
    set('--k-night',kNight.toFixed(3)); set('--k-dusk',kDusk.toFixed(3)); set('--k-sun',kSun.toFixed(3)); set('--k-light',kLight.toFixed(3));
    function placeInSky(name, altitude, azimuth) {
      const east = (1 + Math.cos(altitude * RAD) * Math.sin(azimuth * RAD)) / 2;
      const height = Math.max(0, altitude) / 90;
      set('--' + name + '-x', (6 + 88 * east).toFixed(1) + '%');
      set('--' + name + '-y', (48 - 42 * height).toFixed(1) + '%');
      set('--' + name + '-height', height);
      set('--' + name + '-u', east.toFixed(4));
    }
    placeInSky('sun', e, az);
    placeInSky('moon', moon.alt, moon.az);
    set('--k-moon',(kNight*smooth(-1,3,moon.alt)).toFixed(3)); set('--moon-lit',ph.k.toFixed(3));
    const mp=sky.querySelector('#moon-lit path'); if(mp) mp.setAttribute('d',ph.path);
    sky.querySelector('.moon-lit')?.setAttribute('transform',ph.flip?'scale(-1 1)':'');
    town.dataset.moon=`${moon.alt.toFixed(1)}/${moon.az.toFixed(0)}/${(ph.k*100).toFixed(0)}%`;
    set('--f-b',(1.02-.04*kDusk-.42*kNight).toFixed(3)); set('--f-s',(1.06+.04*kDusk-.56*kNight).toFixed(3));
    set('--f-sp',(.1*kDusk).toFixed(3)); set('--f-h',(-4*kDusk+18*kNight).toFixed(1)+'deg');
    town.classList.toggle('is-dark',kNight>.5);
    town.classList.toggle('no-night-light', kNight === 0);
    town.classList.toggle('full-night', kNight === 1);
    town.classList.toggle('no-dusk-light', kDusk === 0);
    town.classList.toggle('no-camp-light', kLight === 0);
    for(const [el,th] of lights) el.classList.toggle('on',kLight>th);
    town.dataset.sun=e.toFixed(1);
  }
  update(); setInterval(update,60000);

  document.body.classList.add('town-ready');
  const initial = modules.find(m => '#' + m.id === location.hash && m.id !== 'about-me' && m.id !== 'news');
  if (initial) openModule(initial);
})();
