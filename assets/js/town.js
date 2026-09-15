(() => {
  'use strict';
  const map = document.getElementById('town-map');
  if (!map) return;
  const modules = [
    {id: 'about-me', title: 'About Me', place: 'The courtyard house', x: 210, y: 110, kind: 'house', scale: .96, lot: [65,28,280,174,'#a9bd70']},
    {id: 'services', title: 'Services', place: 'The Dutch windmill', x: 635, y: 106, kind: 'windmill', scale: .98, rise: 64, lot: [534,22,231,191,'#a4b968']},
    {id: 'publications', title: 'Publications', place: 'Huygens Building - Radboud University', x: 303, y: 540, kind: 'huygens', scale: 1.5, lot: [26,337,382,399,'#a1b973']},
    {id: 'educations', title: 'Education', place: 'Erasmus Building - Radboud University', x: 955, y: 90, kind: 'erasmus', scale: 1.05, rise: 230, lot: [886,20,189,194,'#a6bf73']},
    {id: 'news', title: 'News', place: 'The shopping arcade', x: 637, y: 441, kind: 'mall', scale: 1.02, lot: [530,340,234,204,'#a6bb74']},
    {id: 'miscellaneous', title: 'Miscellaneous', place: 'The seaside campsite', x: 987, y: 689, kind: 'camp', scale: .8, lot: [887,651,188,87,'#8fae50']},
    {id: 'cv', title: 'CV', place: 'The post office', x: 982, y: 452, kind: 'post', scale: .82, lot: [901,365,173,174,'#a5bd71']}
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
    return `<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cy="4" rx="17" ry="7" fill="#557138" opacity=".2"/><path d="M0 0v-35" stroke="#8f744b" stroke-width="5"/><ellipse cy="-38" rx="19" ry="29" fill="#88ad49"/><path d="M0-67a19 29 0 0 1 0 58" fill="#70923d"/><ellipse cx="-6" cy="-47" rx="5" ry="9" fill="#a6c563"/></g>`;
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
      const [fx,fy]=point(66,47,0);
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
  landscape += groundFace([[0,760],[1100,760],[1100,905],[0,905]],'#65aabb');
  landscape += groundFace([[0,865],[1100,865],[1100,905],[0,905]],'#4f92a5');
  landscape += `<path d="${shore(809)}L${ground(1100,740)}L${ground(0,740)}Z" fill="#edcf88"/>`;
  landscape += `<g><path class="sea-wave" d="${shore(815)}" fill="none" stroke="#fff9e8" stroke-width="6"/><path class="sea-wave" d="${shore(855)}" fill="none" stroke="#b9e0df" stroke-width="2"/></g>`;
  landscape += groundFace([[0,0],[1100,0],[1100,760],[0,760]],'#94ae59');
  landscape += groundFace([[0,760],[1100,760],[1100,760,-12],[0,760,-12]],'#bcb79c');
  landscape += groundFace([[1100,0],[1100,760],[1100,760,-12],[1100,0,-12]],'#a7a991');
  for(const m of modules) landscape += tile(...m.lot);
  landscape += tile(534,652,228,84,'#a9c379');
  // The southern street ends at the campus, leaving its larger parcel uninterrupted.
  const crossStreets=[{y:270,start:0},{y:595,start:470}];
  const avenues=[470,820];
  for(const {y,start} of crossStreets) landscape += tile(start,y-52,1100-start,104,'#c9c6bc');
  for(const x of avenues) landscape += tile(x-52,0,104,760,'#c9c6bc');
  for(const {y,start} of crossStreets) landscape += tile(start,y-32,1100-start,64,'#757b7a');
  for(const x of avenues) landscape += tile(x-32,0,64,760,'#757b7a');
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
  landscape += tile(460,771,44,100,'#a97c50');
  for(let y=778;y<872;y+=12) landscape += line([460,y],[504,y],'#d3a773',2);
  for(const x of [458,505]) for(const y of [786,844]) landscape += line([x,y,-2],[x,y,12],'#795935',4);
  landscape += tile(138,770,25,43,'#d08068')+tile(185,779,28,40,'#91bccc');
  const [ux,uy]=ground(173,766);
  landscape += `<g transform="translate(${ux} ${uy})"><path d="M0 0v-31" stroke="#9c784e" stroke-width="3"/><path d="M-25-28Q0-52 25-28Q0-14-25-28" fill="#f0b85e"/><path d="M-25-28Q-10-46 0-43L0-21Z" fill="#f9e9b8"/></g>`;
  for (const [x,y,s] of [[22,220,.65],[370,180,.72],[535,195,.65],[770,190,.7],[882,210,.75],[1060,223,.6],[14,348,.6],[407,365,.6],[32,700,.8],[406,700,.7],[540,523,.65],[775,516,.6],[883,545,.6],[1078,555,.72],[565,705,.75],[766,705,.7],[430,110,.65]]) {
    const p=ground(x,y);
    landscape+=tree(p[0],p[1],s);
  }
  for(const [x,y] of [[414,332],[878,331],[414,699],[878,652]]) {
    const p=ground(x,y);
    landscape+=`<g transform="translate(${p})"><ellipse cy="3" rx="8" ry="3" fill="#687750" opacity=".3"/><path d="M0 0v-48h10" fill="none" stroke="#5d645c" stroke-width="3"/><circle cx="10" cy="-47" r="5" fill="#ffe5a2"/></g>`;
  }
  // The lattice tower sits at the far edge of the coastal district.
  const [tx,ty]=ground(1080,25);
  landscape+=`<g transform="translate(${tx} ${ty})"><ellipse cy="3" rx="23" ry="8" fill="#788052" opacity=".25"/><path d="M-21 0L-5-108H5L21 0M-15-28H15M-10-57H10M-6-85H6M-20-1L14-29-10-57 6-85M20-1L-14-29 10-57-6-85M0-108v-26" fill="none" stroke="#545955" stroke-width="3" stroke-linejoin="round"/><path d="M-10-108H10" stroke="#545955" stroke-width="4"/><circle cy="-137" r="4" fill="#d87553"/></g>`;
  function car(color,from,to,extra='') {
    let shape=block(-40,-15,80,30,18,[color,'#a64f42',color]);
    shape+=block(-25,-13,44,26,16,['#d6e7df','#92bdc1','#f4e3bd'],18);
    for(const x of [-23,-6,11]) shape+=windowPane(x,14,21,12,10,'#79a9b2');
    for(const x of [-24,25]) {const p=point(x,17,0);shape+=`<ellipse cx="${p[0]}" cy="${p[1]}" rx="7" ry="8" fill="#4d524d"/><circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#d6d6ba"/>`;}
    const a=ground(...from),b=ground(...to);
    return `<g class="town-car ${extra}" style="--from-x:${a[0]}px;--from-y:${a[1]}px;--to-x:${b[0]}px;--to-y:${b[1]}px"><g transform="translate(-130 -146)">${shape}</g></g>`;
  }
  landscape+=car('#d77357',[60,270],[1060,270]);
  landscape+=car('#e6c46f',[535,595],[1050,595],'second-car');
  map.innerHTML = `<svg class="town-ground" viewBox="0 0 1200 800" aria-hidden="true">${landscape}</svg>`;
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
    button.title = m.place;
    button.innerHTML = building(m.kind,rise) + `<span class="building-label">${m.title}</span>`;
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
  document.body.classList.add('town-ready');
  const initial = modules.find(m => '#' + m.id === location.hash && m.id !== 'about-me' && m.id !== 'news');
  if (initial) openModule(initial);
})();
