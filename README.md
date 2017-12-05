# RipGUI

A GUI for [Ripgrep](https://github.com/BurntSushi/ripgrep). Built with
[electron-vue](https://github.com/SimulatedGREG/electron-vue).

![Demo video](./docs/ripgui_demo.gif)

# Features

* Graphical user interface
* Auto-escape regex characters
* Click search results to open files

# Usage

```bash
# install dependencies
brew install ripgrep
yarn install

# serve with hot reload at localhost:9080
yarn dev

# build electron application for production
yarn build

# run unit & end-to-end tests
yarn test
# or just the unit test server
yarn unit

# lint all JS/Vue component files in `src/`
yarn lint
```

# Roadmap

* Dropdown history
  * with persistence between runs
* Filetype include/exclude GUI
  * and other Ripgrep options
* Open with working directory passed in as `ARGV[1]`
  * Remember last working directory
* Move from CSS to Sass
* Automated testing
* Automated releases

# Known bugs

* Weird bad-filename-with-parens parsing
* Escaping is subject to debounce time

# License

MIT
