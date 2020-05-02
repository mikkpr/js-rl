const WFCTool2D = function(){
  const tiles = [];
  const colors = {};
  const weights = [];
  let nPrototypes = 0;
  const formulae = [];
  
  
  const transformBank = {
    cw:function(m){
      const r = [];
      for (let i = 0; i < m.length; i++){
        r.push([]);
        for (let j = m.length-1; j >= 0; j--){
          r[r.length-1].push(m[j][i]); 
        }
      }
      return r;
    },
    
    fx:function(m){
      const r = [];
      for (let i = 0; i < m.length; i++){
        r.push([]);
        for (let j = m[0].length-1; j >= 0; j--){
          r[r.length-1].push(m[i][j]); 
        }
      }
      return r;
    },
    fy:function(m){
      const r = [];
      for (let i = m.length-1; i >= 0; i--){
        r.push([]);
        for (let j = 0; j < m[i].length; j++){
          r[r.length-1].push(m[i][j]); 
        }
      }
      return r;
    }
  };
  
  
  function equal(m,r){
    for (let i = 0; i < m.length; i++){
      for (let j = 0; j < m[0].length; j++){
        if (m[i][j] != r[i][j]){
          return false;
        }
      }
    }
    return true;
  }
  
  function fit(d,a,b){
    if (d == "x"){
      for (let i = 0; i < a.length; i++){
        if (a[i][a[i].length-1] != b[i][0]){
          return false;
        }
      }
    }else if (d == "y"){
      for (let i = 0; i < a[0].length; i++){
        if (a[a.length-1][i] != b[0][i]){
          return false;
        }
      }
    }
    return true;
  }
  
  this.addTile = function(s,{transforms="auto",weight=1}={}){
    const t = s.split("\n").map(x=>x.split(""));
    tiles.push(t);
    formulae.push([ nPrototypes, '', t ]);
    weights.push(weight);
    
    const tests = [];
    
    if (transforms == "auto"){
      transforms = ['cw','cw+cw','cw+cw+cw'];
    }
    
    for (let i = 0; i < transforms.length; i++){
      const tl = transforms[i].split("+");
      let tt = t;
      for (let j = 0; j < tl.length; j++){
        tt = transformBank[tl[j]](tt);
      }
      tests.push(tt);
    }
    for (let i = 0; i < tests.length; i++){
      let ok = true;
      for (let j = 0; j < tiles.length; j++){
        if (equal(tests[i],tiles[j])){
          ok = false;
          break;
        }
      }
      if (ok){
        tiles.push(tests[i]);
        weights.push(weight);
        formulae.push([ nPrototypes, transforms[i], tests[i] ]);
      }
    }
    nPrototypes++;
  };
  
  this.addColor = function(symbol, color){
    colors[symbol] = color;
  };
  
  this.getTileFormulae = function(){
    return formulae;
  };
  
  this.generateWFCInput = function(){
    const rules = [];
    for (let i = 0; i < tiles.length; i++){
      for (let j = 0; j < tiles.length; j++){

        if (fit("x",tiles[i],tiles[j])){
          rules.push(['x',i,j]);
        }
        if (fit("y",tiles[i],tiles[j])){
          rules.push(['y',i,j]);
        }
      }
    }
    return {weights,rules,nd:2};
  };
  
  let viewportCached = {x:0,y:0,w:-1,h:-1};
  let waveCached = {};
  
  this.clearPlotCache = function(){
    waveCached = {};
  };
  
  this.plotWFCOutput = function(canvas,viewport,wave){
    const ctx = canvas.getContext('2d');
    const w = tiles[0][0].length;
    const h = tiles[0].length;

    const cw = canvas.width/viewport.w;
    const ch = canvas.height/viewport.h;
    
    if (viewportCached.x != viewport.x || viewportCached.y != viewport.y || viewportCached.w != viewport.w || viewportCached.h != viewport.h){
      console.log("no cache");
      waveCached = {};
      ctx.fillStyle = "black";
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }
    viewportCached = {x:viewport.x,y:viewport.y,w:viewport.w,h:viewport.h};
    
    for (const k in wave){
      if (k in waveCached){
        continue;
      }
      waveCached[k] = wave[k];
      let [y,x] = k.split(",").map(x=>parseInt(x));
      x = (x-viewport.x)/viewport.w*canvas.width;
      y = (y-viewport.y)/viewport.h*canvas.height;
      
      const v = wave[k];
      
      for (let i = 0; i < h; i++){
        for (let j = 0; j < w; j++){
   
          let rgb = [0,0,0];
          if (typeof v === 'number'){
            rgb = colors[tiles[v][i][j]];
          }else{
            for (let ii = 0; ii < tiles.length; ii++){
              rgb[0] += colors[tiles[ii][i][j]][0]*v[ii];
              rgb[1] += colors[tiles[ii][i][j]][1]*v[ii];
              rgb[2] += colors[tiles[ii][i][j]][2]*v[ii];
            }
            rgb = rgb.map(Math.round);
          }
          ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
          ctx.fillRect(x+cw*j/w,y+ch*i/h,cw/w+1,ch/h+1);
        }
      }
    }
  };
  
};



const WFCTool3D = function(){
  const tiles = [];
  const materials = {};
  const weights = [];
  let nPrototypes = 0;
  const formulae = [];
  
  
  const transformBank = {
    ry:function(m){
      const r = JSON.parse(JSON.stringify(m));
      for (let i = 0; i < m.length; i++){
        for (let j = 0; j < m.length; j++){
          for (let k = 0; k < m.length; k++){
            r[i][j][k] = m[i][m.length-1-k][j]; 
          }
        }
      }
      return r;
    },
    
    rx:function(m){
      const r = JSON.parse(JSON.stringify(m));
      for (let i = 0; i < m.length; i++){
        for (let j = 0; j < m.length; j++){
          for (let k = 0; k < m.length; k++){
            r[i][j][k] = m[k][j][m.length-1-i]; 
          }
        }
      }
      return r;
    },
    
    rz:function(m){
      const r = JSON.parse(JSON.stringify(m));
      for (let i = 0; i < m.length; i++){
        for (let j = 0; j < m.length; j++){
          for (let k = 0; k < m.length; k++){
            r[i][j][k] = m[m.length-1-j][i][k]; 
          }
        }
      }
      return r;
    },
    
    fz:function(m){
      const r = JSON.parse(JSON.stringify(m));
      for (let i = 0; i < m.length; i++){
        for (let j = 0; j < m[0].length; j++){
          for (let k = 0; k < m[0][0].length; k++){
            r[i][j][k] = m[i][j][m.length-1-k]; 
          }
        }
      }
      return r;
    },
    
    fx:function(m){
      const r = JSON.parse(JSON.stringify(m));
      for (let i = 0; i < m.length; i++){
        for (let j = 0; j < m[0].length; j++){
          for (let k = 0; k < m[0][0].length; k++){
            r[i][j][k] = m[i][m.length-1-j][k]; 
          }
        }
      }
      return r;
    },
    
    fy:function(m){
      
      const r = JSON.parse(JSON.stringify(m));

      for (let i = 0; i < m.length; i++){
        for (let j = 0; j < m[0].length; j++){
          for (let k = 0; k < m[0][0].length; k++){
            r[i][j][k] = m[m.length-1-i][j][k]; 
          }
        }
      }
      return r;
    },
  };

  function equal(m,r){
    for (let i = 0; i < m.length; i++){
      for (let j = 0; j < m[0].length; j++){
        for (let k = 0; k < m[0][0].length; k++){
          if (m[i][j][k] != r[i][j][k]){
            return false;
          }
        }
      }
    }
    return true;
  }
  
  function fit(d,a,b){
    if (d == "x"){
      for (let i = 0; i < a.length; i++){
        for (let j = 0; j < a[i][0].length; j++){
          if (a[i][a[i].length-1][j] != b[i][0][j]){
            return false;
          }
        }
      }
    }else if (d == "y"){
      for (let i = 0; i < a[0].length; i++){
        for (let j = 0; j < a[i][0].length; j++){
          if (a[a.length-1][i][j] != b[0][i][j]){
            return false;
          }
        }
      }
    }else if (d == "z"){
      for (let i = 0; i < a.length; i++){
        for (let j = 0; j < a[0].length; j++){
          if (a[i][j][a[i][0].length-1] != b[i][j][0]){
            return false;
          }
        }
      }      
    }
    return true;
  }
  
  this.addTile = function(s, { transforms = "auto", weight = 1 } = {}){
    const t = s.map(y=>y.split("\n").map(x=>x.split("")));
    tiles.push(t);
    formulae.push([ nPrototypes, '', t ]);
    weights.push(weight);
    
    const tests = [];
    
    if (transforms == "auto"){
      transforms = ['ry','ry+ry','ry+ry+ry','fy','fy+ry','fy+ry+ry','fy+ry+ry+ry'];
    }
    
    for (let i = 0; i < transforms.length; i++){
      const tl = transforms[i].split("+");
      let tt = t;
      for (let j = 0; j < tl.length; j++){
        tt = transformBank[tl[j]](tt);
      }
      tests.push(tt);
    }
    for (let i = 0; i < tests.length; i++){
      let ok = true;
      for (let j = 0; j < tiles.length; j++){
        if (equal(tests[i],tiles[j])){
          ok = false;
          break;
        }
      }
      if (ok){
        tiles.push(tests[i]);
        weights.push(weight);
        formulae.push([ nPrototypes, transforms[i], tests[i] ]);
      }
    }
    nPrototypes++;
  };
  
  this.addMaterial = function(symbol, material){
    materials[symbol] = material;
  };
  
  this.getTileFormulae = function(){
    return formulae;
  };
  
  this.generateWFCInput = function(){
    const rules = [];
    for (let i = 0; i < tiles.length; i++){
      for (let j = 0; j < tiles.length; j++){

        if (fit("x",tiles[i],tiles[j])){
          rules.push(['x',i,j]);
        }
        if (fit("y",tiles[i],tiles[j])){
          rules.push(['y',i,j]);
        }
        if (fit("z",tiles[i],tiles[j])){
          rules.push(['z',i,j]);
        }
      }
    }
    return {weights,rules,nd:3};
  };
  
  /*global describe THREE */
  this.plotWFCOutput = function(root,wave){

    while (root.children.length){
      root.children.pop();
    }
    
    const wz = tiles[0][0][0].length;
    const wx = tiles[0][0].length;
    const wy = tiles[0].length;
    
    const geometry = new THREE.BoxGeometry( 1/wx, 1/wy, 1/wz );

    for (const K in wave){
      const [y,x,z] = K.split(",").map(x=>parseInt(x));
      for (let i = 0; i < wy; i++){
        for (let j = 0; j < wx; j++){
          for (let k = 0; k < wz; k++){
            const material = materials[tiles[wave[K]][i][j][k]];
            if (material){
              const cube = new THREE.Mesh(geometry,material);
              cube.position.set(x+j/wx,y+i/wy,z+k/wz);
              cube.castShadow = true;
              cube.receiveShadow = true;
              root.add(cube);
            }
          }
        }
      }
    }
  };
  
};

export {
  WFCTool2D,
  WFCTool3D
};