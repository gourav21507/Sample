import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./App.css";
import Navbar from './components/Navbar';

function App() {
  const cesiumContainer = useRef(null);

  useEffect(() => {
    const viewer = new Cesium.Viewer(cesiumContainer.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      baselayer:false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      globe: new Cesium.Globe(Cesium.Ellipsoid.MARS),
    });
    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(
  new Cesium.UrlTemplateImageryProvider({
    url: "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
    tilingScheme: new Cesium.GeographicTilingScheme({
      ellipsoid: Cesium.Ellipsoid.MARS,
    }),
  })
);
  viewer.scene.skyAtmosphere.show = false;
  viewer.scene.globe.showGroundAtmosphere = false;
  const marsRadius = Cesium.Ellipsoid.MARS.maximumRadius;
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10_000;
  viewer.scene.screenSpaceCameraController.maximumZoomDistance =
    marsRadius * 50;
  const markerLongitude = 77.58;
  const markerLatitude = 18.38;
  const markerPosition = Cesium.Cartesian3.fromDegrees(
    markerLongitude,
    markerLatitude,
    1000,
    Cesium.Ellipsoid.MARS,
  );
  const markerOverlay = document.createElement("div");
  markerOverlay.setAttribute("aria-label", "Jezero Crater");
  markerOverlay.style.cssText =
    "position:absolute;display:flex;align-items:center;gap:8px;z-index:10;pointer-events:none;transform:translate(-50%,-50%);";

  const markerDot = document.createElement("span");
  markerDot.style.cssText =
    "width:18px;height:18px;flex:none;border:2px solid #111;border-radius:50%;background:#ffeb00;box-shadow:0 0 0 4px rgba(255,235,0,.25);";

  const markerLabel = document.createElement("span");
  markerLabel.textContent = "Jezero Crater";
  markerLabel.style.cssText =
    "padding:4px 8px;border-radius:3px;background:rgba(20,20,20,.82);color:white;font:600 14px sans-serif;white-space:nowrap;";

  markerOverlay.append(markerDot, markerLabel);
  cesiumContainer.current.append(markerOverlay);

  const updateMarkerOverlay = () => {
    const screenPosition = Cesium.SceneTransforms.worldToWindowCoordinates(
      viewer.scene,
      markerPosition,
    );
    const { clientWidth, clientHeight } = cesiumContainer.current;

    if (
      !screenPosition ||
      screenPosition.x < 0 ||
      screenPosition.x > clientWidth ||
      screenPosition.y < 0 ||
      screenPosition.y > clientHeight
    ) {
      markerOverlay.style.display = "none";
      return;
    }

    markerOverlay.style.display = "flex";
    markerOverlay.style.left = `${screenPosition.x}px`;
    markerOverlay.style.top = `${screenPosition.y}px`;
  };
  const removePostRenderListener =
    viewer.scene.postRender.addEventListener(updateMarkerOverlay);
  updateMarkerOverlay();

  viewer.camera.lookAt(
    markerPosition,
    new Cesium.HeadingPitchRange(
      0,
      -Cesium.Math.PI_OVER_FOUR,
      marsRadius * 2.5,
    ),
  );

    return () => {
      removePostRenderListener();
      markerOverlay.remove();
      viewer.destroy();
    };
  }, []);

  return (
    <>
    <Navbar />
    <div
      ref={cesiumContainer}
      style={{
        width: "100%",
        height: "calc(100vh - 60px)",
      }}
      
      />
      </>
  );
}

export default App;