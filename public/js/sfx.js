var sounds = {
  hit: new Howl({
    src: ['public/sound/hit.mp3']
  }),
  theme: new Howl({
    src: ['public/sound/theme.mp3']
  })
};

window.playSfx = function (name) {
  sounds[name].play();
};