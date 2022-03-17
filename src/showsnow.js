import React from "react";
import Stats from "stats.js";
import * as THREE from "three";
import snow from "./snow.png"
import trouble_sky from "./troubled-sky.jpg"

class Showsnow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  initThree() {
    var scene, camera, renderer;
    var stats;
    var group;
    var velocity = [];

    init();

    function init() {
      addScene();
      addLights();
      addPlane();
      addStats();
      addSprites();
      animate();
    }

    function addScene() {
      //场景
      scene = new THREE.Scene();
      scene.background = new THREE.TextureLoader().load(trouble_sky);

      //摄像机
      var width = window.innerWidth;
      var height = window.innerHeight;
      camera = new THREE.PerspectiveCamera(60, width / height, 1, 3000);
      camera.position.set(0, 100, 500);
      camera.lookAt(scene.position);

      //渲染器
      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      // renderer.setClearColor(0xb9d3ff, 1);
      document.getElementById("show").appendChild(renderer.domElement);
      window.addEventListener("resize", onWindowResize, false);
    }

    function addLights() {
      //光照
      var spotLight = new THREE.SpotLight(0xffffff, 0.5);
      spotLight.position.set(0, 500, 100);
      scene.add(spotLight);
      spotLight.lookAt(scene);

      var pointLight = new THREE.PointLight(0xffffff, 2, 1000, 1);
      pointLight.position.set(0, 200, 200);
      scene.add(pointLight);
    }

    //加入地面
    function addPlane() {
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
      scene.add(plane);
    }

    //加入Stat插件
    function addStats() {
      //stat.js显示运行状态
      stats = new Stats();
      stats.showPanel(0);
      stats.dom.style.position = "absolute";
      stats.dom.style.left = "0px";
      stats.dom.style.top = "64px";
      document.getElementById("container").appendChild(stats.dom);
    }

    //加入粒子
    function addSprites() {
      //设定材质
      var loader = new THREE.TextureLoader();
      var texture = loader.load(snow);
      group = new THREE.Group();
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
        velocity.push(2 * vx, vy, 2 * vz);

        group.add(sprite);
      }

      scene.add(group);
    }

    //动画
    function animate() {
      stats.begin();
      renderer.render(scene, camera);

      groupUpdate();

      stats.end();
      requestAnimationFrame(animate);
    }

    //更新粒子位置
    function groupUpdate() {
      //提取group的children数组
      var children = group.children;
      for (let i = 0; i < children.length; i++) {
        //粒子位置变化
        children[i].position.x -= velocity[i * 3];
        children[i].position.y -= velocity[i * 3 + 1];
        children[i].position.z -= velocity[i * 3 + 2];
        // children[i].material.rotation += 0.1 * (Math.random() - 0.5);
        //速度随机变化
        velocity[i * 3] += 0.1 * Math.random() - 0.05;
        velocity[i * 3 + 1] += 0.002;
        velocity[i * 3 + 2] += 0.1 * Math.random() - 0.05;

        //如果雪花下降到地面以下
        if (group.children[i].position.y < -200) {
          //重置位置
          children[i].position.x = 2000 * (Math.random() - 0.5);
          children[i].position.y = 1000;
          children[i].position.z = 2000 * (Math.random() - 0.5);
          //重置速度
          velocity[i * 3] = 2 * (Math.random() - 0.5);
          velocity[i * 3 + 1] = Math.random();
          velocity[i * 3 + 2] = 2 * (Math.random() - 0.5);
        }
      }
    }

    //窗口大小变化时重新设定摄像头和渲染器的尺寸
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  componentDidMount() {
    this.initThree();
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
