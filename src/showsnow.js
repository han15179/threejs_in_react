import React from "react";
import Stats from "stats.js";
import * as THREE from "three";
import snow from "./snow.png";
import trouble_sky from "./troubled-sky.jpg";

class Showsnow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.initThree = this.initThree.bind(this);
    this.addScene = this.addScene.bind(this);
    this.addLights = this.addLights.bind(this);
    this.addPlane = this.addPlane.bind(this);
    this.addStats = this.addStats.bind(this);
    this.addSprites = this.addSprites.bind(this);
    this.animate = this.animate.bind(this);
    this.groupUpdate = this.groupUpdate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
  }
  initThree() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.stats = null;
    this.group = null;
    this.velocity = [];

    this.addScene();
    this.addLights();
    this.addPlane();
    this.addStats();
    this.addSprites();
    this.animate();
  }

  addScene() {
    //场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.TextureLoader().load(trouble_sky);

    //摄像机
    var width = window.innerWidth;
    var height = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 3000);
    this.camera.position.set(0, 100, 500);
    this.camera.lookAt(this.scene.position);

    //渲染器
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    // renderer.setClearColor(0xb9d3ff, 1);
    document.getElementById("show").appendChild(this.renderer.domElement);
    window.addEventListener("resize", this.onWindowResize, false);
  }

  addLights() {
    //光照
    var spotLight = new THREE.SpotLight(0xffffff, 0.5);
    spotLight.position.set(0, 500, 100);
    this.scene.add(spotLight);
    spotLight.lookAt(this.scene);

    var pointLight = new THREE.PointLight(0xffffff, 2, 1000, 1);
    pointLight.position.set(0, 200, 200);
    this.scene.add(pointLight);
  }

  //加入地面
  addPlane() {
    //地面
    var plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2000, 2000, 9, 24),
      new THREE.MeshLambertMaterial({
        color: "#3c5887",
        fog: false,
      })
    );

    //从PlaneBufferGeometry中提取出坐标数组，修改z坐标
    var vertices = plane.geometry.attributes.position.array;
    for (let i = 0, l = Math.floor(vertices.length / 3); i < l; i++) {
      var y = Math.floor(i / 10);
      var x = i - y * 10;
      var d = 240;
      if (x === 4 || x === 5) {
        d = 120;
        vertices[3 * i + 2] = Math.random() * d * 2 - d;
      } else {
        d = 240;
        vertices[3 * i + 2] = Math.random() * d * 2 - d;
      }
      if (y === 0 || y === 24) {
        vertices[3 * i + 2] = -60;
      }
    }

    plane.rotation.x = -Math.PI / 3;
    plane.position.y = -100;
    this.scene.add(plane);
  }

  //加入Stat插件
  addStats() {
    //stat.js显示运行状态
    this.stats = new Stats();
    this.stats.showPanel(0);
    this.stats.dom.style.position = "absolute";
    this.stats.dom.style.left = "0px";
    this.stats.dom.style.top = "64px";
    document.getElementById("container").appendChild(this.stats.dom);
  }

  //加入粒子
  addSprites() {
    //设定材质
    var loader = new THREE.TextureLoader();
    var texture = loader.load(snow);
    this.group = new THREE.Group();
    var spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.6,
    });

    for (let i = 0; i < 3000; i++) {
      var sprite = new THREE.Sprite(spriteMaterial);
      // scene.add(sprite);
      sprite.scale.set(8, 10, 1);
      var k1 = Math.random() - 0.5;
      var k2 = Math.random();
      var k3 = Math.random() - 0.5;
      sprite.position.set(1000 * k1, 1500 * k2, 1000 * k3);

      var vx = Math.random() - 0.5;
      var vy = Math.random();
      var vz = Math.random() - 0.5;
      this.velocity.push(2 * vx, vy, 2 * vz);

      this.group.add(sprite);
    }

    this.scene.add(this.group);
  }

  //动画
  animate() {
    if (this.scene != null) {
      this.stats.begin();
      this.renderer.render(this.scene, this.camera);

      this.groupUpdate();

      this.stats.end();
      requestAnimationFrame(this.animate);
    }
  }

  //更新粒子位置
  groupUpdate() {
    //提取group的children数组
    var children = this.group.children;
    for (let i = 0; i < children.length; i++) {
      //粒子位置变化
      children[i].position.x -= this.velocity[i * 3];
      children[i].position.y -= this.velocity[i * 3 + 1];
      children[i].position.z -= this.velocity[i * 3 + 2];
      // children[i].material.rotation += 0.1 * (Math.random() - 0.5);
      //速度随机变化
      this.velocity[i * 3] += 0.1 * Math.random() - 0.05;
      this.velocity[i * 3 + 1] += 0.002;
      this.velocity[i * 3 + 2] += 0.1 * Math.random() - 0.05;

      //如果雪花下降到地面以下
      if (this.group.children[i].position.y < -200) {
        //重置位置
        children[i].position.x = 2000 * (Math.random() - 0.5);
        children[i].position.y = 1000;
        children[i].position.z = 2000 * (Math.random() - 0.5);
        //重置速度
        this.velocity[i * 3] = 2 * (Math.random() - 0.5);
        this.velocity[i * 3 + 1] = Math.random();
        this.velocity[i * 3 + 2] = 2 * (Math.random() - 0.5);
      }
    }
  }

  //窗口大小变化时重新设定摄像头和渲染器的尺寸
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  componentDidMount() {
    this.initThree();
  }

  componentWillUnmount() {
    this.renderer.forceContextLoss();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.stats = null;
    this.group = null;
    this.velocity = [];
  }

  render() {
    return (
      <>
        <div id="container"></div>
        <div id="show"></div>
      </>
    );
  }
}

export default Showsnow;
