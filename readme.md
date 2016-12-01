
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

 * 素材

  万能的贴吧  
  http://tieba.baidu.com/p/2833008853

 * 各种原理

  * 地图实现原理： 地图是通过大小相同的正方形div拼接成的

  * 人物“动起来”的原理，包括2部分： 1.人物原地连续做出走路的姿势， 2.人物移动
  * 原地走路： js定时器，定时切换人物div的css, background-position-x, background-position-y
  * 人物移动： jQuery#animate方法移动人物div到指定点

 * 游戏运行

  http://localhost:3000/rpg/index.html

