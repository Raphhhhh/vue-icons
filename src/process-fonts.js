var Promise, SVGO, fs, iconsDir, loadAliases, path, processSet, set, setname, sets, svgfont2js, svgo, svgpath;

fs = require("fs");

svgfont2js = require("svgfont2js");

SVGO = require("svgo");

svgo = new SVGO();

Promise = require("bluebird");

path = require("path");

svgpath = require("svgpath");

loadAliases = function(less, re) {
  var alias, m, match, unicode_hex;
  m = {};
  match = void 0;
  while (null !== (match = re.exec(less))) {
    alias = match[1];
    unicode_hex = match[2];
    if (m[unicode_hex] == null) {
      m[unicode_hex] = [];
    }
    m[unicode_hex].push(alias);
  }
  return m;
};

sets = {
  fa: {
    re: /@fa-var-([a-z0-9-]+)\s*:\s*"\\([0-9a-f]+)";/g,
    style: "font-awesome/less/variables.less",
    svg: "font-awesome/fonts/fontawesome-webfont.svg"
  },
  glyphicon: {
    re: /glyphicon-([^\s]*)[^\n]*content: "\\([^"]*)"/g,
    style: "bootstrap/less/glyphicons.less",
    svg: "bootstrap/fonts/glyphicons-halflings-regular.svg",
    translateY: 240
  },
  mdi: {
    svg: "mdi/fonts/materialdesignicons-webfont.svg"
  },
  octicon: {
    folder: "octicons/lib/svg",
    re: /([A-Za-z0-9-]+).svg/
  },
  material: {
    svg: "material-design-icons/iconfont/MaterialIcons-Regular.svg"
  },
  iconic: {
    svg: "open-iconic/font/fonts/open-iconic.svg",
    style: "open-iconic/font/css/open-iconic.css",
    re: /\.oi\[data-glyph=([^\]]+)\]:before { content:'\\([^']+)'; }/g
  },
  im: {
    folder: "icomoon-free-npm/SVG",
    re: /[0-9]+-([A-Za-z0-9-]+).svg/
  },
  ra: {
    svg: "ratchet/fonts/ratchicons.svg"
  }
};

processSet = function(setname, set) {
  var aliases, file, folder, glyph, glyphs, i, j, k, len, len1, name, optimizers, processFile, re, ref;
  console.log("processing " + setname);
  re = /d="([\w\s-.]*)"/;
  optimizers = [];
  if (set.svg) {
    if (set.re) {
      aliases = loadAliases(fs.readFileSync(require.resolve(set.style, "utf8")), set.re);
    }
    glyphs = svgfont2js(fs.readFileSync(require.resolve(set.svg, "utf8")));
    for (j = 0, len = glyphs.length; j < len; j++) {
      glyph = glyphs[j];
      optimizers.push(new Promise(function(resolve) {
        var d;
        d = new svgpath(glyph.path);
        if (set.translateY) {
          d = d.translate(0, set.translateY);
        }
        d = d.rel().toString();
        return svgo.optimize("<svg width='" + glyph.width + "' height='" + glyph.height + "'><path d='" + d + "'/></svg>", function(result) {
          var match;
          match = re.exec(result.data);
          if (match != null ? match[1] : void 0) {
            glyph.path = match[1];
            return resolve(glyph);
          } else {
            console.log(setname + ": " + glyph.name + " failed to match");
            return resolve(null);
          }
        });
      }));
    }
  } else if (set.folder) {
    processFile = function(file, name) {
      return optimizers.push(new Promise(function(resolve) {
        return fs.readFile(folder + "/" + file, {
          encoding: "utf8"
        }, function(err, content) {
          if (err) {
            return resolve(null);
          }
          return svgo.optimize(content, function(result) {
            var box, d;
            d = re.exec(result.data);
            box = /viewBox="0 0 ([0-9]+) ([0-9]+)"/.exec(result.data);
            if ((d != null) && d.length > 1 && (box != null) && box.length > 2) {
              return resolve({
                name: name,
                path: d[1],
                width: box[1],
                height: box[2]
              });
            } else {
              console.log(setname + ": " + name + " failed to match");
              return resolve(null);
            }
          });
        });
      }));
    };
    folder = path.resolve("node_modules/" + set.folder);
    ref = fs.readdirSync(folder);
    for (i = k = 0, len1 = ref.length; k < len1; i = ++k) {
      file = ref[i];
      if (file) {
        name = set.re.exec(file);
        if (name != null ? name[1] : void 0) {
          processFile(file, name[1]);
        }
      }
    }
  }
  return Promise.all(optimizers).then(function(glyphs) {
    var alias, data, icon, l, len2, len3, n, names, tmp;
    data = {
      aliases: {},
      icons: {}
    };
    for (l = 0, len2 = glyphs.length; l < len2; l++) {
      glyph = glyphs[l];
      if (glyph != null) {
        if (set.svg && set.re) {
          tmp = glyph['unicode_hex'];
          if (tmp.length === 2) {
            tmp = "00" + tmp;
          } else if (tmp.length === 3) {
            tmp = "0" + tmp;
          }
          names = aliases[tmp];
        } else {
          names = [glyph.name];
        }
        if (names != null) {
          name = names.shift();
          icon = {
            d: glyph.path,
            w: glyph.width,
            h: glyph.height
          };
          if (names.length > 0) {
            for (n = 0, len3 = names.length; n < len3; n++) {
              alias = names[n];
              data.aliases[alias] = name;
            }
            icon.aliases = names;
          }
          data.icons[name] = icon;
        }
      }
    }
    console.log(setname + " " + glyphs.length + " glyphs " + Object.keys(data.icons).length + " icons " + Object.keys(data.aliases).length + " aliases");
    return data;
  }).then(JSON.stringify).then(function(string) {
    return fs.writeFileSync(path.resolve(__dirname + ("/../icons/" + setname + ".json")), string);
  });
};

iconsDir = './icons';

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

for (setname in sets) {
  set = sets[setname];
  processSet(setname, set);
}