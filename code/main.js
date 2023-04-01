import kaboom from "kaboom"


const protocol = location.protocol === "https:" ? "wss" : "ws";
const ws = new WebSocket(`${protocol}://${location.host}/multiplayer`);

  ws.onmessage = (message) => {
    const messageBody = JSON.parse(message.data);
    const player = getplr(messageBody);
    if (player?.local || !player) return
    player.x = messageBody.x
    player.y = messageBody.y
  }




// initialize context
kaboom({
   background: [ 66, 179, 245 ],
})

class Text {
  constructor(x, y, text, follow) {
    const obj = add([
      text(text),
      pos(x, y),
      stay(follow),
      { value: 0 },
    ])

    this.object = obj
  }
  updateText(text) {
    obj.text = text
  }
}

class Timer {
  constructor(player) {
    let time = 0

    var start = Date.now();
    setInterval(function() {
      var delta = Date.now() - start; // milliseconds elapsed since start
      time = Math.floor(delta / 1000); // in seconds
    }, 1000); // update about every second

    const timerText = add([
      text(time),
      pos(24, 24),
      fixed(),
      { value: 0 },
    ])

    timerText.onUpdate((timer) => {
      timerText.text = time
    })
  }
}

class Player {
  constructor() {
    loadSprite("heart", "sprites/heart.png")
    loadSprite("player", "sprites/bang.jpg")
    const player = add([
      // list of components
      sprite("player"),
      health(3),
      pos(80, 40),
      "player",
      area(),
      scale(0.5, 0.5),
      body(),
      { clicked: false, username: "username", local: true },
    ])

  

    onClick('player', (plr) => {
      if (plr.clicked == false) {
        plr.clicked = true
        const obj = add([
          text(plr.username),
          "username_" + plr.username,
          pos(plr.x, plr.y),
          scale(0.5, 0.5),
          follow(plr, vec2(plr.username.length * -4, -75)),
          { value: 0 },
        ])
        const obj2 = add([
          text(plr.hp() + ' hearts'),
          "username_" + plr.username,
          pos(plr.x, plr.y),
          scale(0.3, 0.3),
          follow(plr, vec2(plr.username.length * -4, -95)),
        ])
      } else {
        plr.clicked = false
        const txt = get("username_" + plr.username)[0]
        destroy(txt)
      }
    })



    this.player = player
    this.player.hidden = true
    this.player.paused = true

    onKeyPress("up", () => {
      // .jump() is provided by the body() component
      if (player.isGrounded()) {
        player.jump()
      } else {
        player.doubleJump()
      }
    })


  setTimeout(() => {
        player.onUpdate(() => {
      camPos(player.pos);
      const messageBody = { x: player.x, y: player.y };
      ws.send(JSON.stringify(messageBody));
    });
  }, 5000)


    onKeyDown("left", () => {
      player.move(-220, 0);
    });
    onKeyDown("right", () => {
      player.move(220, 0);
    });
  }
  spawn() {
    this.player.hidden = false
    this.player.paused = false
    const dta = { username: "username!", color: "red" }
  }
  getPlayer() {
    return this.player
  }
  despawn() {
    this.player.hidden = true
    this.player.paused = true
  }
}

class OtherPlayer {
  constructer(username, id) {
    loadSprite("player", "sprites/bang.jpg")
    const player = add([
      // list of components
      sprite("player"),
      health(3),
      pos(80, 40),
      "otherplayer",
      id,
      username,
      area(),
      scale(0.5, 0.5),
      body(),
      { clicked: false, username: "username" },
    ])
    this.player = player
  }
  getPlayer() {
    return this.player
  }
}

class Block {
  constructor(x, y, texture, scale_x, scale_y, movable) {
    // load al of the block textures
    loadSprite("ground_prototype", "sprites/grounds/prototype.png")



    if (movable == true) {
      const block = add([
        sprite(texture),
        pos(x, y),
        area(),
        solid(),
        scale(scale_x, scale_y),
        "movable"
      ])
    } else {
      const block = add([
        sprite(texture),
        pos(x, y),
        area(),
        solid(),
        scale(scale_x, scale_y),

      ])
    }

    // only do collision checking when a block is close to player for performance
    onUpdate("block", (b) => {
      b.solid = b.pos.dist(player.pos) <= 64
    })
  }
}

class Level {
  constructor(level) {
    this.loadLevel(level)
  }
  loadLevel(number) {
    const jsonData = require("./levels/1.json")
    const blocks = jsonData.blocks

    blocks.forEach((block) => {
      new Block(block.x, block.y, block.texture, block.size.x, block.size.y)
    })
  }
}

function getplr(messageBody) {
  const sender = messageBody.sender;
  const id = messageBody.id
  let player = get(id)[0]
  if (player) return player
  newpls = new OtherPlayer(sender, id)
  player = newpls.getPlayer()
  return player
}

const player = new Player()
const timer = new Timer(player.getPlayer())
const level = new Level('1')

player.spawn()

onCollide("movable", "wall", (a, b) => {
  a.speed = 0;
});

onCollide("movable", "movable", (a, b) => {
  if (a.speed > b.speed) b.direction = a.direction;
  else if (a.speed <= b.speed) a.direction = b.direction;
  finalSpeed = (a.speed) + (b.speed) / (a.mass + b.mass);
  a.speed = finalSpeed;
  b.speed = finalSpeed;
});