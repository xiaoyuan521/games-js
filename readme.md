
* 技术选型

 * js采用CommonJS范式， 采用browserify进行浏览器支持。
 * 前台还是使用jquery
 * unit test 使用 jasmine
 * 后台服务器使用 nodejs + koajs

* npm 全局安装包

 * npm install -g jasmine
 * npm install -g browserify
 * npm install -g watchify
 * npm install -g nodemon

* snake

 * 编译js

  watchify snake/*.js -o snake/build/bundle.js --debug

 * 启动后台

  nodemon server_snake.js


 * unit test的执行

  jasmine

 * 游戏运行

  http://localhost:3000/snake/index.html

* rpg

 * 编译js

  watchify rpg/frontend/*.js -o rpg/build/bundle.js --debug

 * 启动后台

  nodemon rpg/server.js

 * unit test的执行

  jasmine

 * 游戏运行

  http://localhost:3000/rpg/index.html
