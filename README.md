# vue-icons

This is a refactoring of https://github.com/vue-comps/vue-icons, but which works with the new vue.js versions, and without coffee or pug.

webpack based - load only what you need - svg inline icons.

comes with (and prefixes):
- [Font Awesome](https://fortawesome.github.io/Font-Awesome/icons/) - `fa`
- [Google Material Design Icons](https://design.google.com/icons/) - `material` - spaces in icon names are replaced by `_`, e.g. `material-done_all`.
- [Material Design Icons](https://materialdesignicons.com/) - `mdi`
- [Octicons](https://octicons.github.com/) - `octicon`
- [Open Iconic](https://useiconic.com/open#icons) - `iconic`
- [Glyphicons](http://getbootstrap.com/components/#glyphicons) - `glyphicon`
- [IcoMoon-free](https://icomoon.io/#preview-free) - `im`
- [ratchicons](http://goratchet.com/components/#ratchicons) - `ra` - add `and` for android version `ra-download` -> `ra-and-download`


heavily inspired by [vue-awesome](https://github.com/Justineo/vue-awesome).

# Install

```sh
npm install --save-dev vue-icons callback-loader
```

## Usage

In module.rules:
```
{
  test: /vue-icons/,
  loader: 'callback-loader',
  enforce: 'post'
}
```

in plugins:
```
new webpack.LoaderOptionsPlugin({
  options: {
    callbackLoader: require('vue-icons/icon-loader')(['material-add', 'material-remove'])
  }
})
```

in your component:
```
import 'vue-icons'
```
```html
<icon name="fa-thumbs-up"></icon>
```

This will load a font-compatible version of the component.
The `height` of the icon will be set to `font-size` and as `svg` render as inline item, it will fit in the middle of `line-height` and responds to `vertical-align` similar as normal glyphs.

### ERROR: Module build failed: SyntaxError: 'with' in strict mode
Currently [buble](https://gitlab.com/Rich-Harris/buble) is injecting `strict` mode in all processed js files. The down to ES5 compiled component contains `with`, which is forbidden in `strict` mode.
Buble is used, for example, in rollup, which is used in laravel.

If you are running in this problem, make sure to exclude this component from processing with buble.

#### Props
Name | type | default | description
---:| --- | ---| ---
name | String | - | (required) name of the icon
flip-v | String | - | apply vertical flipping
flip-h | String | - | apply horizontal flipping
offset-x | Number | 0 | move the icon left/right within its borders in percentage (relative to the center)
offset-y | Number | 0 | move the icon up/down within its borders in percentage (relative to the center)
label | String | name | aria-label

### Plain icon

if you don't need the font-compatibility you can also use the plain icon component:

This has three additional props:

Name | type | default | description
---:| --- | ---| ---
size | Number | 16 | height of the icon in px
scale | Number | 1 | size multiplier
hcenter | Boolean | false | sets the height to equal the parentElement and moves the icon to the center

### Spinners
comes without css, so no spinning included, you can do it manually like this:
```css
//css
.spin {
  animation: spin 1s 0s infinite linear;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```
```html
<icon name="fa-spinner" class="spin"></icon>
```
