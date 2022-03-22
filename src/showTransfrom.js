import React from "react";
import Stats from "stats.js";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import gradient from "./gradient.png";
import ac_vertices from "./ac_vertices.js";
import kv_vertices from "./kv_vertices.js";

class ShowTransform extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  initThree() {
    var scene, camera, renderer, points;
    var stats;
    var glist = [];
    var index = 0;

    init();

    function init() {
      addScene();
      addLights();
      addStats();
      initGlist();
      addPoints();
      animate();
    }

    function addScene() {
      //场景
      scene = new THREE.Scene();

      //摄像机
      var width = window.innerWidth;
      var height = window.innerHeight;
      camera = new THREE.PerspectiveCamera(60, width / height, 1, 3000);
      camera.position.set(0, 0, 600);
      camera.lookAt(scene.position);

      //渲染器
      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      // renderer.setClearColor(0xb9d3ff, 1);
      document.body.appendChild(renderer.domElement);
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

    //定义模型数据
    function initGlist() {
      let geometry = new THREE.SphereGeometry(120, 60, 60);
      let vertices = geometry.attributes.position.array;
      // console.log(vertices);
      glist.push(vertices);

      geometry = new THREE.BoxBufferGeometry(150, 150, 150, 20, 20, 20);
      vertices = geometry.attributes.position.array;
      glist.push(vertices);

      geometry = new THREE.RingGeometry(20, 120, 60, 60);
      vertices = geometry.attributes.position.array;
      glist.push(vertices);

      geometry = new THREE.ConeBufferGeometry(120, 180, 60, 60, true);
      vertices = geometry.attributes.position.array;
      glist.push(vertices);

      geometry = new THREE.PlaneBufferGeometry(240, 240, 40, 40);
      vertices = geometry.attributes.position.array;
      glist.push(vertices);

      geometry = new THREE.TorusBufferGeometry(90, 20, 60, 60);
      vertices = geometry.attributes.position.array;
      glist.push(vertices);

      geometry = new THREE.TorusKnotBufferGeometry(120, 20, 300, 20, 3, 7);
      vertices = geometry.attributes.position.array;
      glist.push(vertices);

      vertices = ac_vertices.map((item) => item * 120);
      glist.push(vertices);

      vertices = kv_vertices.map((item) => item * 20);
      glist.push(vertices);
    }

    function addPoints() {
      const POINT_NUMBER = 10000;

      let geometry = new THREE.BufferGeometry();
      let pos = [];
      for (let i = 0; i < POINT_NUMBER; i++) {
        pos.push(rangeRandom(window.innerWidth / 2, -window.innerWidth / 2));
        pos.push(rangeRandom(window.innerHeight / 2, -window.innerHeight / 2));
        pos.push(rangeRandom(window.innerWidth / 2, -window.innerWidth / 2));
      }
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(pos), 3)
      );

      let material = new THREE.PointsMaterial({
        size: 4,
        sizeAttenuation: true,
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        map: new THREE.TextureLoader().load(gradient),
        depthWrite: false,
        depthTest: false,
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);
      console.log(points);

      new TWEEN.Tween(points.rotation)
        .to(
          {
            y: Math.PI / 2,
          },
          100000
        )
        .repeat(Infinity)
        .start();

      window.addEventListener("click", onClickPoints, false);
    }

    //加入Stat插件
    function addStats() {
      //stat.js显示运行状态
      stats = new Stats();
      stats.showPanel(0);
      stats.dom.style.position = "absolute";
      stats.dom.style.left = "0px";
      stats.dom.style.top = "0px";
      document.getElementById("container").appendChild(stats.dom);
    }

    //动画
    function animate() {
      stats.begin();
      renderer.render(scene, camera);

      TWEEN.update();
      points.geometry.attributes.position.needsUpdate = true;

      stats.end();
      requestAnimationFrame(animate);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onClickPoints() {
      var vertices = points.geometry.attributes.position.array;
      var count = points.geometry.attributes.position.count;

      index++;
      index %= glist.length;
      let nextVertices = glist[index];
      let nextVerticesLength = nextVertices.length;

      for (let i = 0; i < count - 1000; i++) {
        let position = {
          x: vertices[3 * i],
          y: vertices[3 * i + 1],
          z: vertices[3 * i + 2],
        };
        new TWEEN.Tween(position)
          .to(
            {
              x: nextVertices[(3 * i) % nextVerticesLength],
              y: nextVertices[(3 * i + 1) % nextVerticesLength],
              z: nextVertices[(3 * i + 2) % nextVerticesLength],
            },
            1000
          )
          .onUpdate(function () {
            vertices[3 * i] = position.x;
            vertices[3 * i + 1] = position.y;
            vertices[3 * i + 2] = position.z;
          })
          .easing(TWEEN.Easing.Exponential.In)
          .delay(1000 * Math.random())
          .start();
      }
    }

    function rangeRandom(max, min) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
  }

  componentDidMount() {
    this.initThree();
  }

  render() {
    return (
      <>
        <div id="container"></div>
        <div id="transform"></div>
      </>
    );
  }
}

export default ShowTransform;
