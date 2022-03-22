import React from "react";
import Stats from "stats.js";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import gradient from "./gradient.png";
import ac_vertices from "./ac_vertices.js";
import kv_vertices from "./kv_vertices.js";
import { Button } from "antd";

class ShowTransform extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
    this.initThree = this.initThree.bind(this);
    this.addLights = this.addLights.bind(this);
    this.initGlist = this.initGlist.bind(this);
    this.addPoints = this.addPoints.bind(this);
    this.addStats = this.addStats.bind(this);
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onClickPoints = this.onClickPoints.bind(this);
    this.rangeRandom = this.rangeRandom.bind(this);
  }

  initThree() {
    //场景
    var scene = new THREE.Scene();
    this.scene = scene;

    //摄像机
    var camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      3000
    );
    camera.position.set(0, 0, 600);
    camera.lookAt(scene.position);
    this.camera = camera;

    //渲染器
    var renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setClearColor(0xb9d3ff, 1);
    document.getElementById("transform").appendChild(renderer.domElement);
    window.addEventListener("resize", this.onWindowResize, false);
    this.renderer = renderer;

    var index = 0;
    this.index = index;

    this.addLights();
    this.addStats();
    this.initGlist();
    this.addPoints();
    this.animate();
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

  //定义模型数据
  initGlist() {
    var glist = [];
    this.glist = glist;

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

  addPoints() {
    const POINT_NUMBER = 10000;

    let geometry = new THREE.BufferGeometry();
    let pos = [];
    for (let i = 0; i < POINT_NUMBER; i++) {
      pos.push(this.rangeRandom(window.innerWidth / 2, -window.innerWidth / 2));
      pos.push(
        this.rangeRandom(window.innerHeight / 2, -window.innerHeight / 2)
      );
      pos.push(this.rangeRandom(window.innerWidth / 2, -window.innerWidth / 2));
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

    var points = new THREE.Points(geometry, material);
    this.points = points;
    this.scene.add(points);
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

  //动画
  animate() {
    this.stats.begin();
    this.renderer.render(this.scene, this.camera);

    TWEEN.update();
    this.points.geometry.attributes.position.needsUpdate = true;

    this.stats.end();
    requestAnimationFrame(this.animate);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onClickPoints() {
    var vertices = this.points.geometry.attributes.position.array;
    var count = this.points.geometry.attributes.position.count;

    this.index++;
    this.index %= this.glist.length;
    let nextVertices = this.glist[this.index];
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

  rangeRandom(max, min) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  componentDidMount() {
    this.initThree();
  }

  componentWillUnmount() {
    console.log("unmount");
    this.renderer.forceContextLoss();
    this.renderer = null;
  }

  render() {
    return (
      <>
        <div id="container"></div>
        <Button
          id="button"
          style={{ position: "absolute", right: "0", top: "64px" }}
          disabled={this.state.loading}
          onClick={() => {
            this.onClickPoints();
            this.setState({
              loading: true,
            });
            setTimeout(() => {
              this.setState({
                loading: false,
              });
            },2000);
          }}
        >
          transform
        </Button>
        <div id="transform"></div>
      </>
    );
  }
}

export default ShowTransform;
