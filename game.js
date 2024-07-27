const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container',
    // width: '100%',
    // height: '100%'
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);




let player;
let movingRight = true; // Variable para controlar la dirección del movimiento
let touchCount = 0; // Contador de toques
let lastTouchTime = 0; // Tiempo del último toque

let bomb;
let gameOver = false;

let bombSpeed = 60; // Velocidad inicial de la bomba
let startTime; // Tiempo de inicio del juego
let elapsedTime = 0; // Tiempo transcurrido
let scoreText; // Texto para mostrar el tiempo sobrevivido
let personajeSelect = 2;
function preload() {


  this.load.image("sky", "assets/sky.jpg");
  this.load.image("ground", "assets/ground.png");
  this.load.image("reiniciar", "assets/reiniciar.png");
  // this.load.image("star", "assets/star.png");
  this.load.spritesheet("bomb", "assets/bomb.png", {
    frameWidth: 32,
    frameHeight: 36,
  });
  if (personajeSelect == 2) {
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 128,
      frameHeight: 192,
    });
  }
  if (personajeSelect == 1) {
    this.load.spritesheet("dude", "assets/dude2.png", {
      frameWidth: 169,
      frameHeight: 197, 
    });
  }
  this.load.image("dead", "assets/dead.png");
  this.load.image("piso", "assets/plataform.png");
  //Importar sonido salto
  this.load.audio('salto', 'assets/salto.mp3');
}

let platforms;
const aceleracion = 100;
const maxVelocidad = 1000;

function create() {



  

  // Posiciona la imagen de fondo para que ocupe toda la pantalla
  // this.add.image(240, 400, "sky").setScale(2);

  platforms = this.physics.add.staticGroup(); 
  this.background = this.add.tileSprite(0, 0, 480, 800, "sky").setOrigin(0, 0);
  
  // Crea plataformas
  platforms.create(100, 800, "ground").setScale(1, 0.75).refreshBody().setOrigin(0.2, 0.7); // Suelo
  
  let platform = platforms.create(300, 600, "piso").setScale(0.6).refreshBody() // Plataforma 1

  // platform.body.setSize(platform.width *0.55, platform.height*0.10);
  // platform.body.setOffset(platform.width * 0.2, platform.height * 0.25);
  setupOneWayPlatform(this, platform);
  

  let platform2 = platforms.create(100, 450, "piso").setScale(0.6).refreshBody() // Plataforma 1

  // platform2.body.setSize(platform2.width *0.55, platform2.height*0.10);
  setupOneWayPlatform(this, platform2);

  let platform3 = platforms.create(300, 300, "piso").setScale(0.6).refreshBody() // Plataforma 1

  setupOneWayPlatform(this, platform3);

  let platform4 = platforms.create(100, 150, "piso").setScale(0.6).refreshBody() // Plataforma 1

  setupOneWayPlatform(this, platform4);
  

  // this.add.image(240, 800, "ground")
  // let groundBody = this.add.rectangle(183, 835);
  // this.physics.add.existing(groundBody, true);
  // this.physics.add.collider(player, groundBody);
//   platforms.create(400, 600, "ground");
//   platforms.create(50, 450, "ground");
//   platforms.create(450, 300, "ground");




// tiempo de juego
startTime = this.time.now;
  
// scoreText = this.add.text(16, 16, 'Tiempo: 0', { fontSize: '32px', fill: '#000' });
scoreText = this.add.text(16, 16, 'Tiempo: 0', { 
  fontSize: '32px', 
  fill: '#ffffff',
  align: 'center',



}).setShadow(0, 0, '#00eaff', 10, true, true);


// scoreText = this.add.text(100, 30, 'Tiempo: 0', {
//   fontSize: '32px',
//   fill: '#ffffff',
//   align: 'center',
//   // backgroundColor: 'rgba(0, 0, 51, 0.8)',
  
//   // padding: {
//   //   x: 10,
//   //   y: 5
//   // },
//   // fixedWidth: anchoJuego,
//   // fixedHeight: 50
// }).setOrigin(0.5).setShadow(0, 0, '#00eaff', 10, true, true);







if (personajeSelect == 1) {

    // Crear el jugador y configurarlo
  player = this.physics.add.sprite(100, 640, "dude");

  player.body.setSize(player.width - 115, player.height - 70); // Reduce el tamaño del área de colisión en la parte superior
  player.body.setOffset(55, 30); // Ajusta el desplazamiento si es necesario

  // player.setBounce(0.2);
  // player.setCollideWorldBounds(true);
  player.setScale(1.3); 
  player.setGravityY(300);
  // this.physics.add.collider(player, platforms);
  platforms.children.entries.forEach(platform => {
    this.physics.add.collider(player, platform, null, checkCollision, this);
  });
}

if (personajeSelect == 2) {
  // Crear el jugador y configurarlo
  player = this.physics.add.sprite(100, 640, "dude");

  player.body.setSize(player.width - 35, player.height - 30); // Reduce el tamaño del área de colisión en la parte superior
  player.body.setOffset(15, 20); // Ajusta el desplazamiento si es necesario

  // player.setBounce(0.2);
  // player.setCollideWorldBounds(true);
  player.setScale(1); 
  player.setGravityY(300);
  // this.physics.add.collider(player, platforms);
  platforms.children.entries.forEach(platform => {
    this.physics.add.collider(player, platform, null, checkCollision, this);
  });

}
  // this.physics.add.collider(player, plataformaElevada);



  // Crear enemigo bomba
  bomb = this.physics.add.sprite(250, 100, "bomb");
  bomb.body.setSize(20, 25);
  // bomb.setScale(0.2); 
  // // bomb.setBounce(1);
  // bomb.setCollideWorldBounds(true);
  bomb.setScale(3); 
  // bomb.setGravityY(300);
  // this.physics.add.collider(bomb, platforms);
  platforms.children.entries.forEach(platform => {
    this.physics.add.collider(bomb, platform, null, checkCollision, this);
  });
  // this.physics.add.collider(player, bomb, () => {
  //   this.physics.pause();
  //   player.setTint(0xff0000);
  //   console.log("Game Over");
  //   player.anims.play("turn");
  //   gameOver = true;
  //   this.input.keyboard.enabled = false; // Disable keyboard input
  // });


  // Animaciones de la bomba
  this.anims.create({
    key: "bomb",
    frames: this.anims.generateFrameNumbers("bomb", { start: 0, end: 4 }),
    frameRate: 5,
    repeat: -1,
  });

  bomb.anims.play("bomb");
 





  // Animacion muerto cambia al jugador por la imagen de muerto
  // this.anims.create({
  //   key: "dead",
  //   frames: [{ key: "dead", frame: 0 }],
  //   frameRate: 0,
  // });


  // Animaciones del jugador
  if (personajeSelect == 1) {
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 3, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });
    
    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 0 }],
      frameRate: 20,
    });
  
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 3, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });
  }


if (personajeSelect == 2) {
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 2 }),
    frameRate: 10,
    repeat: -1,
  });
  
  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 0 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 3, end: 5 }),
    frameRate: 10,
    repeat: -1,
  });
}

  // // Controles del jugador con teclado
  // this.input.keyboard.on("keydown-LEFT", () => {
  //   player.setAccelerationX(-aceleracion);
  //   player.anims.play("left", true);
  //   player.flipX = true;
  // });
  
  // this.input.keyboard.on("keydown-RIGHT", () => {
  //   player.setAccelerationX(aceleracion);
  //   player.anims.play("right", true);
  //   player.flipX = false;
  // });
  
  // this.input.keyboard.on("keyup-LEFT", () => {
  //   if (player.body.velocity.x < 0) {
  //     player.setAccelerationX(0);
  //     player.setVelocityX(0);
  //     player.anims.play("turn");
  //   }
  // });
  
  // this.input.keyboard.on("keyup-RIGHT", () => {
  //   if (player.body.velocity.x > 0) {
  //     player.setAccelerationX(0);
  //     player.setVelocityX(0);
  //     player.anims.play("turn");
  //   }
  // });

  // this.input.keyboard.on("keydown-UP", () => {
  //   if (player.body.touching.down) {
  //     player.setVelocityY(-450);
  //   }
  // });

  // Controles del jugador con pantalla táctil


  this.time.addEvent({
    delay: 100, // Ejecutar cada 100ms
    callback: movePlayer,
    callbackScope: this,
    loop: true
  });

  // Detectar toques/clics en la pantalla
  this.input.on('pointerdown', function (pointer) {
    let currentTime = new Date().getTime();
    touchCount++;
    
    if (touchCount === 1) {
        // Primer toque: saltar
        if (player.body.touching.down) {
            player.setVelocityY(-450);
            // Reproducir sonido de salto
            this.sound.play('salto');
        }
    }
    
    if (touchCount === 2 && (currentTime - lastTouchTime) < 300) {
        // Doble toque: cambiar dirección
        movingRight = !movingRight;
        touchCount = 0;
    }
    
    // Reiniciar el contador después de un tiempo
    this.time.delayedCall(300, function() {
        touchCount = 0;
    }, [], this);
    
    lastTouchTime = currentTime;
  }, this);









}


// Función para mover al jugador
function movePlayer() {
  if (movingRight) {
      player.setVelocityX(200); // Ajusta la velocidad según necesites
      player.anims.play("right", true);
      player.flipX = false;
  } else {
      player.setVelocityX(-200);
      player.anims.play("left", true);
      player.flipX = true;
  }
}




// funcion para colicion de plataforma 

function setupOneWayPlatform(scene, platform) {
  // Ajusta el tamaño de la colisión si es necesario
  platform.body.setSize(platform.width * 0.55, platform.height * 0.10);
  // platform.body.setOffset(platform.width * 0.225, 0);
  
  // Añade una propiedad para verificar si el jugador está arriba
  platform.canCollide = false;
  
  scene.physics.world.on('worldstep', () => {
    platform.canCollide = (player.body.bottom <= platform.body.top);
  });
}

function checkCollision(object, platform) {
  // Si el objeto es la bomba y el jugador está encima de la plataforma, ignora la colisión
  if (object === bomb && player.body.bottom <= platform.body.top) {
    return false;
  }
  // Para todos los demás casos, sigue la lógica original
  return platform.canCollide;
}


function update() {

  // const velocidadpiso = 2;

  // // // Ajustar la posición del jugador sin detener su movimiento horizontal
  // // const margen = 100; // Margen desde el borde del mapa
  // // if (player.x < margen) {
  // //   player.x = margen; // Mantener al jugador dentro del margen izquierdo
  // // } else if (player.x > this.sys.game.config.width - margen) {
  // //   player.x = this.sys.game.config.width - margen; // Mantener al jugador dentro del margen derecho
  // // }

  // // // Mover el fondo y las plataformas basado en la velocidad del jugador
  // if (player.body.velocity.x > 0) {
  //   // Moviendo a la derecha
  //   // this.background.tilePositionX += velocidadFondo;
  //   platforms.children.entries.forEach((platform) => {
  //     platform.x -= velocidadpiso;
  //     if (platform.x + platform.width < 0) {
  //       platform.x = this.sys.game.config.width;
  //     }
  //   });
  // } else if (player.body.velocity.x < 0) {
  //   // Moviendo a la izquierda
  //   // this.background.tilePositionX -= velocidadFondo;
  //   platforms.children.entries.forEach((platform) => {
  //     platform.x += velocidadpiso;
  //     if (platform.x > this.sys.game.config.width) {
  //       platform.x = -platform.width;
  //     }
  //   });
  // }

  const velocidadFondo = 1;
  const anchoJuego = this.sys.game.config.width;

  // Limitar la velocidad del jugador
  player.body.velocity.x = Phaser.Math.Clamp(player.body.velocity.x, -maxVelocidad, maxVelocidad);

  // // Mover el fondo constantemente
  this.background.tilePositionX += velocidadFondo;


  // Teletransportar al jugador al otro lado del mapa
  if (player.x > anchoJuego) {
    player.x = 0;
  } else if (player.x < 0) {
    player.x = anchoJuego;
  }
  if (bomb.x > anchoJuego) {
    bomb.x = 0;
  } else if (bomb.x < 0) {
    bomb.x = anchoJuego;
  }

  // bomb.setVelocityX(100);

  // Hacer que la bomba persiga al jugador
  const angle = Phaser.Math.Angle.Between(bomb.x, bomb.y, player.x, player.y);
  // esperar 5 segundos antes de moverse
  bomb.setVelocity(
    Math.cos(angle) * bombSpeed,
    Math.sin(angle) * bombSpeed
  );

  if (!gameOver) {
    // Aumentar la velocidad de la bomba con el tiempo
    elapsedTime = (this.time.now - startTime) / 1000; // Tiempo en segundos
    bombSpeed = 60 + Math.floor(elapsedTime / 10) * 10; // Aumenta en 10 cada 10 segundos

    // Actualizar el texto de puntuación
    scoreText.setText('Tiempo: ' + Math.floor(elapsedTime));
  }

 // Mover las plataformas basado en la velocidad del jugador (TO DO)


  // Colisión entre el jugador y la bomba
  this.physics.add.collider(player, bomb, () => {
  //   //parar el tiempo
    
    
    this.physics.pause();
    player.setTint(0xff0000);
    // this.add.text(anchoJuego / 2, 400, 'Game Over', { fontSize: '64px', fill: '#000' }).setOrigin(0.5);
    // this.add.text(anchoJuego / 2, 450, 'Tiempo sobrevivido: ' + Math.floor(elapsedTime) + 's', { fontSize: '32px', fill: '#000' }).setOrigin(0.5);
    this.add.text(anchoJuego / 2, 400, 'Game Over', {
      fontSize: '32px',
      fill: '#ffffff',
      align: 'center',
      backgroundColor: 'rgba(0, 0, 51, 0.8)',
      
      padding: {
        x: 10,
        y: 5
      },
      // fixedWidth: anchoJuego,
      fixedHeight: 50
    }).setOrigin(0.5).setShadow(0, 0, '#00eaff', 10, true, true);
    
    this.add.text(anchoJuego / 2, 450, 'Tiempo sobrevivido: ' + Math.floor(elapsedTime) + 's', {
      fontSize: '32px',
      fill: '#ffffff',
      align: 'center',
      backgroundColor: 'rgba(0, 0, 51, 0.8)',
      
      padding: {
        x: 10,
        y: 5
      },
      // fixedWidth: anchoJuego,
      fixedHeight: 50
    }).setOrigin(0.5).setShadow(0, 0, '#00eaff', 10, true, true);
    player.anims.play("turn");
    gameOver = true;
    this.input.keyboard.enabled = false; // Disable keyboard input
    //moostrar record
    scoreText.setText('Tiempo: ' + Math.floor(elapsedTime));

    // boton reinciar
    const button = this.add.image(anchoJuego / 2, 510, 'reiniciar',{
      backgroundColor: 'rgba(0, 0, 51, 0.8)',
      padding: {
        x: 10,
        y: 5
      },
      fixedWidth: anchoJuego,
      fixedHeight: 50

    }).setScale(0.1).setInteractive();
    button.on('pointerdown', () => {
      gameOver = false
      this.scene.restart();
    });
  });

}
