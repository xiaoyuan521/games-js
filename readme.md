
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

---

* snake

 * 编译js

  watchify snake/*.js -o snake/build/bundle.js --debug

 * 启动后台

  nodemon server_snake.js


 * unit test的执行

  jasmine

 * 游戏运行

  http://localhost:3000/snake/index.html

---

* rpg

 * 编译js

    watchify rpg/frontend/*.js -o rpg/build/bundle.js --debug

 * 启动后台

    nodemon rpg/server_rpg.js

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

    http://localhost:3004/rpg/index.html

 * 剧情脚本的说明

    * 普通对话

    ```
     - character: zhix
       content: 今天天气不错
    ```

    * 对话内容的样式支持

    ```
      - character: boy07
        content: 你好，你是<span class="c_name">风行云</span>吧，我是<span class="c_name">李莫愁</span>
    ```

    * 对话中选择

    ```
     - character: zhix
       content: 恩。。。
       options: 
        - content: 你看大海多好看！
          line_ref: line_2
        - content: 有空儿狼人杀一把？
          line_ref: line_3
    ```

    * 触发剧情

    ```
     - character: zhix
       content: 好的！
       script: 
        key: "02"
    ```

    * 在选项中触发剧情

    ```
      - character: girl01
        content: 让我想想。。。
        options: 
          - content: 接受任务
            script: 
              key: "02"
              mapKey: null      # mapKey 设定的话，则重新加载地图
              position: "3_3"   # position 可以不设定，人物保持原位（用于当前地图刷新）
              faceTo: left      # 人物的面部朝向
          - content: 不接受任务
    ```

    * 人物跟随

    ```
      - character: boy05
        content: "你好"
        follower:
          name: boy05          # 这里只能设定一个名字，可以多人跟随
    ```

    * 结束人物跟随

    ```
      - character: boy05
        content: "你好"
        follower:
          name:                 # 这里设定为空就是结束跟随
    ```
